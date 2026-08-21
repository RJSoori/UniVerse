import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Badge } from "../../shared/ui/badge";
import { SellerProfile } from "./SellerProfile";
import { ChatPanel } from "./ChatPanel";
import {
  ShoppingBag, Plus, Search, Filter,
  Phone, Package, X, Tag, Clock,
  Sparkles, ExternalLink, Flag, User, MessageCircle, ArrowLeft,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllItems,
  getItemById,
  reportItem,
  startConversation,
  getMyConversations,
  sortConversations,
  type MarketplaceItemResponse,
  type ConversationResponse,
} from "./marketplaceApi";

/**
 * Marketplace component - main browse and search interface for buying/selling items
 * Features include: item browsing, search/filter, seller profiles, item reporting,
 * and navigation to seller dashboard for listing items
 */

const CATEGORIES = [
  "All", "Textbooks & Notes", "Electronics", "Clothing & Accessories",
  "Furniture", "Sports & Fitness", "Stationery",
  "Food & Drinks", "Services", "Other",
];

const REPORT_REASONS = [
  "Inappropriate content", "Spam", "Fraudulent listing",
  "Incorrect information", "Other",
];

const CONDITIONS_LABELS: Record<string, string> = {
  BRAND_NEW: "Brand New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  FOR_PARTS: "For Parts",
};

// Cap how many chat panels can be open side-by-side at once
const MAX_OPEN_CHATS = 3;

interface OpenChat {
  conversationId: number;
  itemName: string;
  sellerName: string;
}

export function Marketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | "SELL" | "RENT">("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "price_asc" | "price_desc">("newest");
  const [selectedListing, setSelectedListing] = useState<MarketplaceItemResponse | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [showSellerPrompt, setShowSellerPrompt] = useState(false);
  const [showBuyPrompt, setShowBuyPrompt] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedListingForReport, setSelectedListingForReport] = useState<MarketplaceItemResponse | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [viewingSellerId, setViewingSellerId] = useState<number | null>(null);
  const [activeChats, setActiveChats] = useState<OpenChat[]>([]);
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [showMyMessages, setShowMyMessages] = useState(false);
  const [myConversations, setMyConversations] = useState<ConversationResponse[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<OpenChat | null>(null);
  const [trendingIndex, setTrendingIndex] = useState(0);

  // Holds all marketplace items fetched from backend
  const [items, setItems] = useState<MarketplaceItemResponse[]>([]);
  // Tracks whether items are still loading from the server
  const [loading, setLoading] = useState(true);

  // Loads all marketplace items when component mounts
  useEffect(() => {
    getAllItems()
      .then(setItems)
      .catch(() => toast.error("Failed to load listings"))
      .finally(() => setLoading(false));
  }, []);

  // Poll for the buyer's conversations while the "My Messages" view is open
  useEffect(() => {
    if (!showMyMessages) return;
    const fetchConversations = () => {
      getMyConversations()
        .then((list) => setMyConversations(sortConversations(list)))
        .catch(() => toast.error("Failed to load messages"));
    };
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [showMyMessages]);

  // Top 3 most-viewed active listings, not just the first 3 in list order
  const trendingListings = [...items].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3);

  // Auto-advance the trending carousel, looping back to the start
  useEffect(() => {
    if (trendingListings.length < 2) return;
    const interval = setInterval(() => {
      setTrendingIndex((prev) => (prev + 1) % trendingListings.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [trendingListings.length]);

  // Keep the index in range if the trending list shrinks
  useEffect(() => {
    if (trendingIndex >= trendingListings.length && trendingListings.length > 0) {
      setTrendingIndex(0);
    }
  }, [trendingListings.length, trendingIndex]);

  // Opens a listing's detail view and registers the view server-side (drives Trending)
  const viewListing = (listing: MarketplaceItemResponse) => {
    setSelectedListing(listing);
    getItemById(listing.id)
      .then((fresh) => {
        setSelectedListing(fresh);
        setItems((prev) => prev.map((i) => (i.id === fresh.id ? fresh : i)));
      })
      .catch(() => {});
  };

  // Filters items based on search query, item type (sell/rent), and category, then
  // applies whichever sort is selected on top of the filtered results
  const filtered = items
    .filter((l) => {
      const matchesSearch =
        l.itemName.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = selectedType === "all" || l.type === selectedType;
      const matchesCategory = selectedCategory === "All" || l.category === selectedCategory;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "oldest": return a.id - b.id;
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "newest":
        default: return b.id - a.id;
      }
    });

  // Always shows the seller login/register options — doesn't assume which seller
  // account (if any) is currently active in this browser, matching JobHub's
  // "Recruiter Portal" button.
  const handleListAnItem = () => {
    setShowSellerPrompt(true);
  };

  // Submits a report for an inappropriate or fraudulent listing
  const handleReport = async () => {
    if (!selectedListingForReport || !reportReason) return;
    setIsSubmittingReport(true);
    try {
      await reportItem(selectedListingForReport.id, reportReason);
      setShowReportModal(false);
      setSelectedListingForReport(null);
      setReportReason("");
      toast.success("Report submitted. Thank you for helping keep UniVerse safe!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Adds a chat to the open set (bringing it to front if already open), capping how
  // many can be open side-by-side at once by evicting the oldest.
  const openChat = (chat: OpenChat) => {
    setActiveChats((prev) => {
      const withoutExisting = prev.filter((c) => c.conversationId !== chat.conversationId);
      const next = [...withoutExisting, chat];
      return next.length > MAX_OPEN_CHATS ? next.slice(next.length - MAX_OPEN_CHATS) : next;
    });
  };

  const closeChat = (conversationId: number) => {
    setActiveChats((prev) => prev.filter((c) => c.conversationId !== conversationId));
  };

  // Starts (or resumes) a chat with the seller about a listing
  const handleMessageSeller = async (listing: MarketplaceItemResponse) => {
    setIsStartingChat(true);
    try {
      const conversation = await startConversation(listing.id);
      openChat({
        conversationId: conversation.id,
        itemName: listing.itemName,
        sellerName: listing.seller?.storeName || "Seller",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start chat. Please try again.");
    } finally {
      setIsStartingChat(false);
    }
  };

  // Selects a conversation from the "My Messages" inbox to open full-width, in place
  // of the small floating panel used elsewhere.
  const selectConversation = (conversation: ConversationResponse) => {
    setSelectedConversation({
      conversationId: conversation.id,
      itemName: conversation.item?.itemName || "General inquiry",
      sellerName: conversation.seller.storeName,
    });
  };

  // Display seller profile view when user clicks on a seller
  if (viewingSellerId) {
    return (
      <SellerProfile
        sellerEmail=""
        sellerId={viewingSellerId}
        onBack={() => setViewingSellerId(null)}
        onViewListing={(listing: MarketplaceItemResponse) => {
          setViewingSellerId(null);
          viewListing(listing);
        }}
      />
    );
  }

  // Display the buyer's message inbox — one conversation per seller, across all listings.
  // Two-pane layout: conversation list on the left, the selected chat fills the rest.
  if (showMyMessages) {
    const conversationList = (
      <div className={`w-full sm:w-80 flex-shrink-0 sm:border-r overflow-y-auto ${selectedConversation ? "hidden sm:block" : ""}`}>
        {myConversations.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground px-4">
            <MessageCircle className="size-10 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No conversations yet</p>
            <p className="text-sm">Message a seller from a listing to start one.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {myConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedConversation?.conversationId === conversation.id ? "bg-muted" : ""
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="relative flex-shrink-0">
                  <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {conversation.seller.storeName.charAt(0).toUpperCase()}
                  </div>
                  {conversation.hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-primary border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${conversation.hasUnread ? "font-bold" : "font-medium"}`}>
                      {conversation.seller.storeName}
                    </p>
                    {conversation.lastMessageAt && (
                      <span className={`text-[10px] flex-shrink-0 ${conversation.hasUnread ? "text-primary font-bold" : "text-muted-foreground"}`}>
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className={`text-xs truncate mt-0.5 ${conversation.hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button variant="ghost" className="text-muted-foreground hover:text-primary mb-4" onClick={() => setShowMyMessages(false)}>
          <ArrowLeft className="mr-2 size-4" /> Back to Marketplace
        </Button>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-4">
          <MessageCircle className="size-6 text-primary" /> My Messages
        </h2>

        <div className="flex h-[70vh] min-h-[420px] border rounded-2xl overflow-hidden bg-background">
          {conversationList}
          <div className={`flex-1 min-w-0 ${selectedConversation ? "flex flex-col" : "hidden sm:flex"}`}>
            {selectedConversation ? (
              <>
                <button
                  className="sm:hidden flex items-center gap-2 p-3 border-b text-sm text-muted-foreground hover:text-primary flex-shrink-0"
                  onClick={() => setSelectedConversation(null)}
                >
                  <ArrowLeft className="size-4" /> Back to conversations
                </button>
                <div className="flex-1 min-h-0">
                  <ChatPanel
                    key={selectedConversation.conversationId}
                    conversationId={selectedConversation.conversationId}
                    role="buyer"
                    itemName={selectedConversation.itemName}
                    otherPartyName={selectedConversation.sellerName}
                    variant="embedded"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-center px-4">
                <div>
                  <MessageCircle className="size-10 mx-auto mb-3 opacity-20" />
                  <p className="font-semibold">Select a conversation</p>
                  <p className="text-sm">Choose a seller from the list to view your chat.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeChats.map((chat, index) => (
          <ChatPanel
            key={chat.conversationId}
            conversationId={chat.conversationId}
            role="buyer"
            itemName={chat.itemName}
            otherPartyName={chat.sellerName}
            offset={index}
            onClose={() => closeChat(chat.conversationId)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-muted-foreground text-sm">
            Browse and purchase items from the campus community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowMyMessages(true)}>
            <MessageCircle className="mr-2 h-4 w-4" /> Messages
          </Button>
          <Button onClick={handleListAnItem}>
            <Plus className="mr-2 h-4 w-4" /> List an Item
          </Button>
        </div>
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-3 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-9 bg-background border-none shadow-none focus-visible:ring-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={filterActive ? "default" : "outline"}
          className="sm:w-fit"
          onClick={() => setFilterActive(!filterActive)}
        >
          <Filter className="mr-2 h-3 w-3" /> Filters
        </Button>
      </div>

      {/* ── Expanded Filters ── */}
      {filterActive && (
        <div className="space-y-3 p-4 bg-muted/20 rounded-xl border">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Listing Type</p>
            <div className="flex gap-2 flex-wrap">
              {(["all", "SELL", "RENT"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selectedType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary text-muted-foreground"
                  }`}
                >
                  {t === "all" ? "All" : t === "SELL" ? "For Sale" : "For Rent"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    selectedCategory === c
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort By</p>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { value: "newest", label: "Newest First" },
                  { value: "oldest", label: "Oldest First" },
                  { value: "price_asc", label: "Price: Low to High" },
                  { value: "price_desc", label: "Price: High to Low" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortOption(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    sortOption === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Trending Items ── */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">Trending</span>
            </div>
            {trendingListings.length > 1 && (
              <div className="flex items-center gap-1">
                {trendingListings.map((item, i) => (
                  <button
                    key={item.id}
                    onClick={() => setTrendingIndex(i)}
                    aria-label={`Show trending item ${i + 1}`}
                    className={`size-1.5 rounded-full transition-colors ${i === trendingIndex ? "bg-primary" : "bg-primary/25"}`}
                  />
                ))}
              </div>
            )}
          </div>
          {trendingListings.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic text-center py-2">
              No listings yet - check back soon!
            </p>
          ) : (
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${trendingIndex * 100}%)` }}
              >
                {trendingListings.map((item) => (
                  <div
                    key={item.id}
                    className="w-full flex-shrink-0 flex items-center gap-3 cursor-pointer"
                    onClick={() => viewListing(item)}
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.itemName} className="size-9 rounded-md object-cover border border-border flex-shrink-0" />
                    ) : (
                      <div className="size-9 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Package className="size-4 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.itemName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{item.seller?.storeName}</p>
                    </div>
                    <span className="text-xs font-bold text-primary whitespace-nowrap">
                      LKR {item.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Listings ── */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <Package className="size-12 mx-auto mb-3 opacity-20 animate-pulse" />
            <p className="font-semibold">Loading listings...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <ShoppingBag className="size-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No listings yet</p>
            <p className="text-sm">Check back later - sellers are on their way!</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            <Search className="size-12 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No results found</p>
            <p className="text-sm">Try a different search or filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className="hover:border-primary/40 transition-all border-border/60 cursor-pointer group"
              onClick={() => viewListing(item)}
            >
              <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.itemName} className="size-14 rounded-xl object-cover border border-border flex-shrink-0 group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Package className="size-7 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{item.itemName}</h4>
                      <Badge className={`text-[10px] border-none ${item.type === "SELL" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                        {item.type === "SELL" ? "For Sale" : "For Rent"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[9px] border-border">{CONDITIONS_LABELS[item.condition] || item.condition}</Badge>
                      {item.soldUnits >= item.totalUnits ? (
                        <Badge variant="outline" className="text-[9px] border-destructive/30 text-destructive">
                          {item.type === "RENT" ? "Fully Rented" : "Sold Out"}
                        </Badge>
                      ) : item.totalUnits > 1 ? (
                        <Badge variant="outline" className="text-[9px] border-border">
                          {item.totalUnits - item.soldUnits} of {item.totalUnits} available
                        </Badge>
                      ) : null}
                      {item.category && <Badge variant="outline" className="text-[9px] border-border">{item.category}</Badge>}
                    </div>
                    {item.seller && (
                      <button
                        className="flex items-center gap-1 text-xs text-primary hover:underline mt-1 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingSellerId(item.seller.id);
                        }}
                      >
                        <User className="size-3" />
                        {item.seller.storeName}
                        {item.seller.status === "VERIFIED" ? (
                          <span className="flex items-center gap-0.5 text-green-600 no-underline">
                            <BadgeCheck className="size-3" /> Verified Seller
                          </span>
                        ) : (
                          <span className="text-muted-foreground no-underline">(Unverified)</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">LKR {item.price.toLocaleString()}</p>
                  </div>
                  <Button size="sm" className="h-9" onClick={(e) => { e.stopPropagation(); viewListing(item); }}>
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {item.type === "SELL" ? "Buy" : "Hire"}
                  </Button>
                  <Button
                    variant="ghost" size="sm" className="h-9 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); setSelectedListingForReport(item); setShowReportModal(true); }}
                  >
                    <Flag className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Listing Detail Modal ── */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedListing(null)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {(selectedListing.imageUrls?.length ? selectedListing.imageUrls : selectedListing.imageUrl ? [selectedListing.imageUrl] : []).length > 0 ? (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {(selectedListing.imageUrls?.length ? selectedListing.imageUrls : [selectedListing.imageUrl]).map((url, i) => (
                  <img key={i} src={url} alt={`${selectedListing.itemName} photo ${i + 1}`} className="h-40 w-40 object-cover rounded-xl flex-shrink-0 border border-border" />
                ))}
              </div>
            ) : (
              <div className="h-40 bg-muted flex items-center justify-center rounded-t-2xl">
                <Package className="size-16 text-muted-foreground/20" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-xl font-bold">{selectedListing.itemName}</h3>
                <button onClick={() => setSelectedListing(null)} className="p-1 rounded-full hover:bg-muted transition-colors">
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className={`text-[10px] border-none ${selectedListing.type === "SELL" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                  {selectedListing.type === "SELL" ? "For Sale" : "For Rent"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{CONDITIONS_LABELS[selectedListing.condition] || selectedListing.condition}</Badge>
                {selectedListing.soldUnits >= selectedListing.totalUnits ? (
                  <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                    {selectedListing.type === "RENT" ? "Fully Rented" : "Sold Out"}
                  </Badge>
                ) : selectedListing.totalUnits > 1 ? (
                  <Badge variant="outline" className="text-[10px]">
                    {selectedListing.totalUnits - selectedListing.soldUnits} of {selectedListing.totalUnits} available
                  </Badge>
                ) : null}
                {selectedListing.category && <Badge variant="outline" className="text-[10px]">{selectedListing.category}</Badge>}
              </div>
              {selectedListing.seller && (
                <button
                  className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
                  onClick={() => {
                    setSelectedListing(null);
                    setViewingSellerId(selectedListing.seller.id);
                  }}
                >
                  <User className="size-4" />
                  {selectedListing.seller.storeName}
                  {selectedListing.seller.status === "VERIFIED" ? (
                    <span className="flex items-center gap-0.5 text-green-600 no-underline text-xs">
                      <BadgeCheck className="size-3.5" /> Verified Seller
                    </span>
                  ) : (
                    <span className="text-muted-foreground no-underline text-xs">(Unverified)</span>
                  )}
                </button>
              )}
              <p className="text-2xl font-bold text-primary">
                LKR {selectedListing.price.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
              <div className="space-y-2 text-sm">
                {selectedListing.seller?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{selectedListing.seller.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => setShowBuyPrompt(true)}
                  disabled={selectedListing.soldUnits >= selectedListing.totalUnits}
                >
                  <Tag className="mr-2 size-4" />
                  {selectedListing.soldUnits >= selectedListing.totalUnits
                    ? (selectedListing.type === "RENT" ? "Fully Rented" : "Sold Out")
                    : (selectedListing.type === "SELL" ? "Buy Now" : "Hire Now")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMessageSeller(selectedListing)}
                  disabled={isStartingChat}
                >
                  <MessageCircle className="mr-2 size-4" /> Message
                </Button>
                <Button variant="outline" className="text-muted-foreground hover:text-destructive" onClick={() => { setSelectedListingForReport(selectedListing); setShowReportModal(true); }}>
                  <Flag className="mr-2 size-4" /> Report
                </Button>
                <Button variant="outline" onClick={() => setSelectedListing(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Seller Prompt Modal ── */}
      {showSellerPrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowSellerPrompt(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">List an Item</h3>
                <p className="text-sm text-muted-foreground mt-1">Do you have a seller account?</p>
              </div>
              <button onClick={() => setShowSellerPrompt(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button className="w-full" onClick={() => { setShowSellerPrompt(false); navigate("/seller/register?mode=login"); }}>Login to Seller Account</Button>
              <Button variant="outline" className="w-full" onClick={() => { setShowSellerPrompt(false); navigate("/seller/register?mode=register"); }}>Create a Seller Account</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Buy/Hire Contact Prompt ── */}
      {showBuyPrompt && selectedListing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowBuyPrompt(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Contact the Seller</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  UniVerse doesn't process payments directly - reach out to {selectedListing.seller?.storeName || "the seller"} to arrange the {selectedListing.type === "SELL" ? "purchase" : "rental"}.
                </p>
              </div>
              <button onClick={() => setShowBuyPrompt(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {selectedListing.seller?.phone ? (
                <a
                  href={`tel:${selectedListing.seller.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{selectedListing.seller.phone}</p>
                    <p className="text-[11px] text-muted-foreground">Tap to call</p>
                  </div>
                </a>
              ) : (
                <p className="text-xs text-muted-foreground italic px-1">No phone number on file for this seller.</p>
              )}
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <Button
                className="w-full"
                onClick={() => {
                  setShowBuyPrompt(false);
                  handleMessageSeller(selectedListing);
                }}
                disabled={isStartingChat}
              >
                <MessageCircle className="mr-2 size-4" /> Message on UniVerse
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowBuyPrompt(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Modal ── */}
      {showReportModal && selectedListingForReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Report Listing</h3>
                <p className="text-sm text-muted-foreground mt-1">Why are you reporting "{selectedListingForReport.itemName}"?</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-3">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${reportReason === reason ? "bg-primary/10 border-primary text-primary" : "border-border hover:border-primary/50"}`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleReport} disabled={!reportReason || isSubmittingReport}>
                {isSubmittingReport ? "Submitting..." : "Submit Report"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowReportModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Panels ── */}
      {activeChats.map((chat, index) => (
        <ChatPanel
          key={chat.conversationId}
          conversationId={chat.conversationId}
          role="buyer"
          itemName={chat.itemName}
          otherPartyName={chat.sellerName}
          offset={index}
          onClose={() => closeChat(chat.conversationId)}
        />
      ))}

    </div>
  );
}