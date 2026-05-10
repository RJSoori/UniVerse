import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUniStorage } from "../../shared/hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Badge } from "../../shared/ui/badge";
import { SellerProfile } from "./SellerProfile";
import {
  ShoppingBag, Plus, Search, Filter,
  Phone, Package, X, Tag, Clock,
  Sparkles, ExternalLink, Flag, User,
} from "lucide-react";
import { toast } from "sonner";
import { getAllItems, type MarketplaceItemResponse } from "./marketplaceApi";

const CATEGORIES = [
  "All", "Textbooks & Notes", "Electronics", "Clothing & Accessories",
  "Furniture", "Sports & Fitness", "Stationery",
  "Food & Drinks", "Services", "Other",
];

const REPORT_REASONS = [
  "Inappropriate content", "Spam", "Fraudulent listing",
  "Incorrect information", "Other",
];

export function Marketplace() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | "SELL" | "RENT">("all");
  const [selectedListing, setSelectedListing] = useState<MarketplaceItemResponse | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [showSellerPrompt, setShowSellerPrompt] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedListingForReport, setSelectedListingForReport] = useState<MarketplaceItemResponse | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reports, setReports] = useUniStorage<any[]>("universe-reports", []);
  const [viewingSellerId, setViewingSellerId] = useState<number | null>(null);

  // ✅ Backend state
  const [items, setItems] = useState<MarketplaceItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch items from backend on load
  useEffect(() => {
    getAllItems()
      .then(setItems)
      .catch(() => toast.error("Failed to load listings"))
      .finally(() => setLoading(false));
  }, []);

  const trendingListings = items.slice(0, 3);

  const filtered = items.filter((l) => {
    const matchesSearch =
      l.itemName.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "all" || l.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleListAnItem = () => {
    const activeSeller = localStorage.getItem("universe-active-seller");
    if (activeSeller) {
      navigate("/seller/dashboard");
    } else {
      setShowSellerPrompt(true);
    }
  };

  const handleReport = () => {
    if (!selectedListingForReport || !reportReason) return;
    setReports([
      ...reports,
      {
        listingId: selectedListingForReport.id,
        reason: reportReason,
        reportedAt: new Date().toISOString(),
      },
    ]);
    setShowReportModal(false);
    setSelectedListingForReport(null);
    setReportReason("");
    toast.success("Report submitted. Thank you for helping keep UniVerse safe!");
  };

  // ✅ Show seller profile page
  if (viewingSellerId) {
    return (
      <SellerProfile
        sellerEmail=""
        sellerId={viewingSellerId}
        onBack={() => setViewingSellerId(null)}
        onViewListing={(listing: MarketplaceItemResponse) => {
          setViewingSellerId(null);
          setSelectedListing(listing);
        }}
      />
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
        <Button onClick={handleListAnItem}>
          <Plus className="mr-2 h-4 w-4" /> List an Item
        </Button>
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
        </div>
      )}

      {/* ── Trending Items ── */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm min-h-[120px]">
        <CardHeader className="py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Trending Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {trendingListings.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic text-center py-2">
              No listings yet — check back soon!
            </p>
          ) : (
            <div className="space-y-2">
              {trendingListings.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-primary/5 rounded-lg p-1.5 transition-colors"
                  onClick={() => setSelectedListing(item)}
                >
                  <span className="text-[10px] font-bold text-primary w-4">#{index + 1}</span>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.itemName} className="size-8 rounded-md object-cover border border-border flex-shrink-0" />
                  ) : (
                    <div className="size-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                      <Package className="size-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{item.itemName}</p>
                    <p className="text-[10px] text-muted-foreground">{item.seller?.storeName}</p>
                  </div>
                  <span className="text-xs font-bold text-primary whitespace-nowrap">
                    LKR {item.price.toLocaleString()}
                  </span>
                </div>
              ))}
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
            <p className="text-sm">Check back later — sellers are on their way!</p>
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
              onClick={() => setSelectedListing(item)}
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
                      <Badge variant="outline" className="text-[9px] border-border">{item.condition}</Badge>
                      <Badge variant="outline" className="text-[9px] border-border">{item.status}</Badge>
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
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">LKR {item.price.toLocaleString()}</p>
                  </div>
                  <Button size="sm" className="h-9" onClick={(e) => { e.stopPropagation(); setSelectedListing(item); }}>
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
            {selectedListing.imageUrl ? (
              <div className="flex gap-2 p-4 overflow-x-auto">
                <img src={selectedListing.imageUrl} alt="" className="h-40 w-40 object-cover rounded-xl flex-shrink-0 border border-border" />
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
                <Badge variant="outline" className="text-[10px]">{selectedListing.condition}</Badge>
                <Badge variant="outline" className="text-[10px]">{selectedListing.status}</Badge>
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
                <Button className="flex-1" onClick={() => toast.info(`Contact the seller: ${selectedListing.seller?.storeName}`)}>
                  <Tag className="mr-2 size-4" />
                  {selectedListing.type === "SELL" ? "Buy Now" : "Hire Now"}
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
              <Button className="w-full" onClick={() => { setShowSellerPrompt(false); navigate("/seller/register"); }}>Login to Seller Account</Button>
              <Button variant="outline" className="w-full" onClick={() => { setShowSellerPrompt(false); navigate("/seller/register"); }}>Create a Seller Account</Button>
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
              <Button className="flex-1" onClick={handleReport} disabled={!reportReason}>Submit Report</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowReportModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}