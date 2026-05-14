import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { SellerSettings } from "./SellerSettings";
import {
  Plus, Trash2, ShoppingBag, Package, BarChart3,
  Clock, LogOut, Settings, Tag,
  CheckCircle,
} from "lucide-react";
import {
  getMySellerProfile,
  createItem,
  deleteItem,
  getItemsBySeller,
  clearSellerSession,
  type MarketplaceItemResponse,
  type SellerResponse,
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
  imageUrl: "",
};

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
  // Reference to hidden file input for image uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Fetch seller profile and listings on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const sellerProfile = await getMySellerProfile();
        setSeller(sellerProfile);

       const myItems = await getItemsBySeller(sellerProfile.id);
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
    if (!seller) {
      setFormError("Seller profile not found.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newItem = await createItem({
        itemName: form.itemName,
        description: form.description,
        price: Number(form.price),
        type: form.type,
        condition: form.condition as any,
        imageUrl: form.imageUrl || undefined,
        sellerId: seller.id,
      });

      setListings((prev) => [newItem, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      setFormError("");
      toast.success("Listing created successfully!");
    } catch (error) {
      setFormError("Failed to create listing. Please try again.");
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
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest bg-primary/5">
                  Verified Seller
                </Badge>
                <span className="text-[10px] text-muted-foreground">UniVerse Marketplace</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              className="flex-1 md:flex-none shadow-lg shadow-primary/20"
              onClick={() => { setShowForm(true); setFormError(""); }}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-2xl font-bold">--</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-green-50/50 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-background rounded-xl">
                <BarChart3 className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">--</p>
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
                      onClick={() => setForm({ ...form, type: t })}
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

              <div className="space-y-1">
                <Label>Image URL <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                <Input
                  placeholder="e.g. https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
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
                  onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                          </div>
                          <p className="text-sm font-bold text-primary mt-1">
                            LKR {listing.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
    </div>
  );
}