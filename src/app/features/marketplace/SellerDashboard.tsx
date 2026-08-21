import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { SellerSettings } from "./SellerSettings";
import { ChatPanel } from "./ChatPanel";
import {
  Plus, Trash2, ShoppingBag, Package,
  Clock, LogOut, Settings, Tag,
  CheckCircle, MessageCircle, ShieldAlert,
} from "lucide-react";
import {
  getMySellerProfile,
  createItem,
  uploadItemImages,
  deleteItem,
  getMySellerItems,
  getSellerConversations,
  sortConversations,
  recordUnitsSold,
  reopenForRent,
  clearSellerSession,
  type MarketplaceItemResponse,
  type SellerResponse,
  type ConversationResponse,
} from "./marketplaceApi";
import { toast } from "sonner";

/**
 * Seller Dashboard Component
 * Allows sellers to manage their store inventory: list items for sale/rent,
 * delete listings, view sales, and update account settings
 */

const CONDITIONS = ["BRAND_NEW", "LIKE_NEW", "GOOD", "FAIR", "FOR_PARTS"] as const;
const CONDITIONS_LABELS: Record<string, string> = {
  BRAND_NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

// Available marketplace categories for item classification
const CATEGORIES = [
  "Textbooks & Notes", "Electronics", "Clothing & Accessories",
  "Furniture", "Sports & Fitness", "Stationery",
  "Food & Drinks", "Services", "Other",
];

// Default empty form state for creating new listings
const emptyForm = {
  itemName: "",
  description: "",
  type: "SELL" as "SELL" | "RENT",
  price: "",
  condition: "" as string,
  category: "",
  totalUnits: "1",
};

// Cap how many chat panels can be open side-by-side at once
const MAX_OPEN_CHATS = 3;

export default function SellerDashboard() {
  const navigate = useNavigate();
  // Holds current seller profile information
  const [seller, setSeller] = useState<SellerResponse | null>(null);
  // Holds all items currently listed by this seller
  const [listings, setListings] = useState<MarketplaceItemResponse[]>([]);
  // Controls visibility of item creation form
  const [showForm, setShowForm] = useState(false);
  // Toggles between dashboard view and settings view
  const [isSettings, setIsSettings] = useState(false);
  // Form fields for creating a new item listing
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  // The image file selected for the listing being created, if any
  // Listings require 2-8 photos
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // Conversations with buyers across this seller's listings
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [activeChats, setActiveChats] = useState<ConversationResponse[]>([]);
  // Per-listing "record a sale" quantity input (keyed by item id) and in-flight state
  const [saleQuantities, setSaleQuantities] = useState<Record<number, string>>({});
  const [recordingSaleFor, setRecordingSaleFor] = useState<number | null>(null);

  const handleRecordSale = async (item: MarketplaceItemResponse) => {
    const quantity = Number(saleQuantities[item.id] || "1");
    if (isNaN(quantity) || quantity < 1) {
      toast.error("Enter a valid quantity.");
      return;
    }
    setRecordingSaleFor(item.id);
    try {
      const updated = await recordUnitsSold(item.id, quantity);
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSaleQuantities((prev) => ({ ...prev, [item.id]: "1" }));
      toast.success(
        updated.soldUnits >= updated.totalUnits
          ? `${updated.itemName} is now marked as ${updated.type === "RENT" ? "fully rented" : "sold out"}.`
          : "Sale recorded."
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to record sale.");
    } finally {
      setRecordingSaleFor(null);
    }
  };

  const [reopeningFor, setReopeningFor] = useState<number | null>(null);

  const handleReopenForRent = async (item: MarketplaceItemResponse) => {
    setReopeningFor(item.id);
    try {
      const updated = await reopenForRent(item.id);
      setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      toast.success(`${updated.itemName} is available for rent again.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reopen listing.");
    } finally {
      setReopeningFor(null);
    }
  };

  // Adds a chat to the open set (bringing it to front if already open), capping how
  // many can be open side-by-side at once by evicting the oldest.
  const openChat = (conversation: ConversationResponse) => {
    setActiveChats((prev) => {
      const withoutExisting = prev.filter((c) => c.id !== conversation.id);
      const next = [...withoutExisting, conversation];
      return next.length > MAX_OPEN_CHATS ? next.slice(next.length - MAX_OPEN_CHATS) : next;
    });
  };

  const closeChat = (conversationId: number) => {
    setActiveChats((prev) => prev.filter((c) => c.id !== conversationId));
  };

  // ✅ Fetch seller profile and listings on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellerProfile = await getMySellerProfile();
        setSeller(sellerProfile);

       const myItems = await getMySellerItems();
       setListings(myItems);
      } catch (error) {
        toast.error("Failed to load seller profile. Please login again.");
        navigate("/seller/register");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Poll for conversations (and new message previews) while the dashboard is open
  useEffect(() => {
    const fetchConversations = () => {
      getSellerConversations()
        .then((list) => setConversations(sortConversations(list)))
        .catch(() => {});
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isSettings) {
    return <SellerSettings onBack={() => setIsSettings(false)} />;
  }

  const handleSubmit = async () => {
    if (!form.itemName || !form.description || !form.price || !form.condition || !form.category) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) <= 0) {
      setFormError("Please enter a valid price.");
      return;
    }
    if (form.type === "SELL" && (isNaN(Number(form.totalUnits)) || Number(form.totalUnits) < 1)) {
      setFormError("Please enter a valid number of units (at least 1).");
      return;
    }
    if (imageFiles.length < 2) {
      setFormError("Please add at least 2 photos.");
      return;
    }
    if (imageFiles.length > 8) {
      setFormError("You can add up to 8 photos.");
      return;
    }
    if (!seller) {
      setFormError("Seller profile not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      let newItem = await createItem({
        itemName: form.itemName,
        description: form.description,
        price: Number(form.price),
        type: form.type,
        condition: form.condition as any,
        category: form.category,
        totalUnits: form.type === "RENT" ? 1 : Number(form.totalUnits),
        sellerId: seller.id,
      });

      try {
        newItem = await uploadItemImages(newItem.id, imageFiles);
      } catch (error) {
        toast.error("Listing created, but the photos failed to upload.");
      }

      setListings((prev) => [newItem, ...prev]);
      setForm(emptyForm);
      setImageFiles([]);
      setImagePreviews([]);
      setShowForm(false);
      setFormError("");
      toast.success("Listing created successfully!");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteItem(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success("Listing deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete listing.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <ShoppingBag className="size-12 mx-auto text-primary opacity-50 animate-pulse" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">

        {seller?.banned && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-4">
            <ShieldAlert className="size-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Your account has been suspended</p>
              <p className="text-sm">
                This is due to repeated policy violations. You can't create new listings, and your existing listings
                are hidden from buyers until an admin reviews your account and lifts the suspension.
              </p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <ShoppingBag className="text-primary size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase">
                {seller?.storeName || "Seller Hub"}
              </h2>
              <div className="flex items-center gap-2">
                {seller?.status === "REJECTED" ? (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-destructive/30 text-destructive">
                    Rejected
                  </Badge>
                ) : seller?.status === "PENDING" ? (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-orange-300 text-orange-700">
                    Pending Review
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5">
                    Verified Seller
                  </Badge>
                )}
                <span className="text-[10px] text-muted-foreground">UniVerse Marketplace</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              className="flex-1 md:flex-none shadow-lg shadow-primary/20"
              onClick={() => { setShowForm(true); setFormError(""); }}
              disabled={seller?.banned}
            >
              <Plus className="mr-2 size-4" /> Create Listing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 md:flex-none"
              onClick={() => setIsSettings(true)}
            >
              <Settings className="mr-2 size-4" /> Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/5"
              onClick={() => {
                clearSellerSession();
                navigate("/seller/register");
              }}
            >
              <LogOut className="mr-2 size-4" /> Sign Out
            </Button>
          </div>
        </header>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-none bg-primary/5 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <ShoppingBag className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Active Listings</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-blue-50/50 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <Tag className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Items Sold</p>
                <p className="text-2xl font-bold">
                  {listings.filter((l) => l.type === "SELL").reduce((sum, l) => sum + l.soldUnits, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-orange-50/50 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <Clock className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Items Rented</p>
                <p className="text-2xl font-bold">
                  {listings.filter((l) => l.type === "RENT").reduce((sum, l) => sum + l.timesRented, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Create Listing Form ── */}
        {showForm && (
          <Card className="border-primary/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Tag className="size-5 text-primary" /> New Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">

              <div className="space-y-1">
                <Label>Item Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Calculus Textbook – 3rd Edition"
                  value={form.itemName}
                  onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Description <span className="text-destructive">*</span></Label>
                <textarea
                  rows={3}
                  placeholder="Describe your item..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label>Category <span className="text-destructive">*</span></Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Condition <span className="text-destructive">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, condition: c })}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.condition === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary text-muted-foreground"
                      }`}
                    >
                      {CONDITIONS_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Listing Type <span className="text-destructive">*</span></Label>
                <div className="flex gap-3">
                  {(["SELL", "RENT"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t, totalUnits: t === "RENT" ? "1" : form.totalUnits })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        form.type === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary text-muted-foreground"
                      }`}
                    >
                      {t === "SELL" ? "For Sale" : "For Rent"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Price (LKR) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              {form.type === "SELL" && (
                <div className="space-y-1">
                  <Label>Units Available <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1"
                    min={1}
                    value={form.totalUnits}
                    onChange={(e) => setForm({ ...form, totalUnits: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">How many identical units you're listing (e.g. 3 copies of the same book).</p>
                </div>
              )}

              <div className="space-y-1">
                <Label>Photos <span className="text-destructive">*</span> <span className="text-muted-foreground text-xs font-normal">(2 to 8 required)</span></Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 8);
                    if ((e.target.files?.length || 0) > 8) {
                      toast.error("Only the first 8 photos were kept.");
                    }
                    setImageFiles(files);
                    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
                  }}
                />
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative">
                        <img src={src} alt={`Preview ${i + 1}`} className="size-16 rounded-lg object-cover border border-border" />
                        <button
                          type="button"
                          className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center"
                          onClick={() => {
                            setImageFiles((prev) => prev.filter((_, idx) => idx !== i));
                            setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className={`text-xs ${imageFiles.length < 2 ? "text-destructive" : "text-muted-foreground"}`}>
                  {imageFiles.length} of 8 photos selected {imageFiles.length < 2 && "- at least 2 required"}
                </p>
              </div>

              {formError && <p className="text-xs text-destructive">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  <CheckCircle className="mr-2 size-4" />
                  {isSubmitting ? "Posting..." : "Post Listing"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowForm(false); setForm(emptyForm); setImageFiles([]); setImagePreviews([]); setFormError(""); }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Messages ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="size-5 text-primary" /> Messages
              {conversations.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">{conversations.length}</Badge>
              )}
            </h3>
          </div>
          {conversations.length === 0 ? (
            <div className="py-10 bg-muted/20 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground text-center px-4">
              <MessageCircle className="size-10 mb-3 opacity-10" />
              <p className="font-semibold">No messages yet</p>
              <p className="text-sm max-w-xs">Buyers who message you about your listings will show up here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="hover:border-primary/40 transition-all border-border/60 cursor-pointer"
                  onClick={() => openChat(conversation)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {conversation.item?.imageUrl ? (
                      <img src={conversation.item.imageUrl} alt="" className="size-12 rounded-lg object-cover border border-border flex-shrink-0" />
                    ) : (
                      <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="size-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm truncate">{conversation.buyerName}</p>
                        {conversation.lastMessageAt && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {new Date(conversation.lastMessageAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conversation.item?.itemName || "Item no longer available"}</p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{conversation.lastMessage}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Listings ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock className="size-5 text-primary" /> Your Listings
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {listings.length === 0 ? (
              <div className="py-24 bg-muted/20 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground text-center px-4">
                <ShoppingBag className="size-16 mb-4 opacity-10" />
                <p className="font-semibold text-lg">Your store is empty</p>
                <p className="text-sm max-w-xs">Click "Create Listing" to start selling or renting to the UniVerse community.</p>
              </div>
            ) : (
              listings.map((listing) => (
                <Card key={listing.id} className="group hover:border-primary/40 transition-all border-border/60">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                      <div className="flex items-start gap-5">
                        {listing.imageUrl ? (
                          <img
                            src={listing.imageUrl}
                            alt={listing.itemName}
                            className="size-14 rounded-xl object-cover border border-border flex-shrink-0"
                          />
                        ) : (
                          <div className="size-14 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors flex-shrink-0">
                            <Package className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xl font-bold">{listing.itemName}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {listing.type === "SELL" ? "For Sale" : "For Rent"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {CONDITIONS_LABELS[listing.condition] || listing.condition}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {listing.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {listing.soldUnits >= listing.totalUnits
                                ? (listing.type === "RENT" ? "Fully Rented" : "Sold Out")
                                : `${listing.totalUnits - listing.soldUnits} of ${listing.totalUnits} available`}
                            </Badge>
                          </div>
                          <p className="text-sm font-bold text-primary mt-1">
                            LKR {listing.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {listing.status === "ACTIVE" && listing.soldUnits < listing.totalUnits && (
                          <div className="flex items-center gap-1">
                            {listing.totalUnits > 1 && (
                              <Input
                                type="number"
                                min={1}
                                max={listing.totalUnits - listing.soldUnits}
                                className="h-9 w-16 text-sm"
                                value={saleQuantities[listing.id] ?? "1"}
                                onChange={(e) => setSaleQuantities((prev) => ({ ...prev, [listing.id]: e.target.value }))}
                              />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={recordingSaleFor === listing.id}
                              onClick={() => handleRecordSale(listing)}
                            >
                              {recordingSaleFor === listing.id
                                ? "Saving..."
                                : listing.type === "RENT" ? "Mark Rented" : "Mark Sold"}
                            </Button>
                          </div>
                        )}
                        {listing.type === "RENT" && listing.status === "RENTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reopeningFor === listing.id}
                            onClick={() => handleReopenForRent(listing)}
                          >
                            {reopeningFor === listing.id ? "Saving..." : "Reopen for Rent"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(listing.id)}
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {activeChats.map((chat, index) => (
        <ChatPanel
          key={chat.id}
          conversationId={chat.id}
          role="seller"
          itemName={chat.item?.itemName || "General inquiry"}
          otherPartyName={chat.buyerName}
          offset={index}
          onClose={() => closeChat(chat.id)}
        />
      ))}
    </div>
  );
}