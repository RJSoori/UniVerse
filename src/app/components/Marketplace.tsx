import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  ShoppingBag, Plus, Search, Filter,
  MapPin, Phone, Package, X, Tag, Clock,
  Sparkles, ExternalLink
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  description: string;
  type: "sell" | "rent";
  amount: string;
  rentPeriod?: string;
  condition: string;
  category: string;
  contactNumber: string;
  location: string;
  images: string[];
  postedAt: string;
}

interface MarketplaceProps {
  onNavigate?: (section: string) => void;
}

const CATEGORIES = [
  "All",
  "Textbooks & Notes",
  "Electronics",
  "Clothing & Accessories",
  "Furniture",
  "Sports & Fitness",
  "Stationery",
  "Food & Drinks",
  "Services",
  "Other",
];

export function Marketplace({ onNavigate }: MarketplaceProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState<"all" | "sell" | "rent">("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filterActive, setFilterActive] = useState(false);
  const [showSellerPrompt, setShowSellerPrompt] = useState(false);

  // Read listings posted by sellers from localStorage
  const rawListings = JSON.parse(localStorage.getItem("universe-listings") || "[]") as Listing[];

  // Trending: top 3 most recent listings
  const trendingListings = [...rawListings].slice(0, 3);

  // Filter listings
  const filtered = rawListings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || l.category === selectedCategory;
    const matchesType =
      selectedType === "all" || l.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // ✅ Check for active seller session; if found go straight to dashboard
  const handleListAnItem = () => {
    const activeSeller = localStorage.getItem("universe-active-seller");
    if (activeSeller) {
      onNavigate?.("seller-dashboard");
    } else {
      setShowSellerPrompt(true);
    }
  };

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
        {/* ✅ Was: onClick={() => setShowSellerPrompt(true)} */}
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
              {(["all", "sell", "rent"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                    selectedType === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary text-muted-foreground"
                  }`}
                >
                  {t === "all" ? "All" : t === "sell" ? "For Sale" : "For Rent"}
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-3 border-primary/20 bg-primary/5 shadow-sm min-h-[120px]">
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
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="size-8 rounded-md object-cover border border-border flex-shrink-0"
                      />
                    ) : (
                      <div className="size-8 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                        <Package className="size-4 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.category}</p>
                    </div>
                    <span className="text-xs font-bold text-primary whitespace-nowrap">
                      LKR {Number(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Listings ── */}
      <div className="grid grid-cols-1 gap-4">
        {rawListings.length === 0 ? (
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
                  {item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="size-14 rounded-xl object-cover border border-border flex-shrink-0 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors flex-shrink-0">
                      <Package className="size-7 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <Badge
                        className={`text-[10px] border-none ${
                          item.type === "sell"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.type === "sell" ? "For Sale" : "For Rent"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-muted-foreground text-sm font-medium">{item.category}</p>
                      <Badge variant="outline" className="text-[9px] border-border">{item.condition}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="size-3" /> {item.location}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      LKR {Number(item.amount).toLocaleString()}
                    </p>
                    {item.type === "rent" && (
                      <p className="text-[10px] text-muted-foreground">/ {item.rentPeriod}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="h-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedListing(item);
                    }}
                  >
                    <ExternalLink className="mr-2 h-3 w-3" />
                    {item.type === "sell" ? "Buy" : "Hire"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Listing Detail Modal ── */}
      {selectedListing && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedListing(null)}
        >
          <div
            className="bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedListing.images.length > 0 ? (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {selectedListing.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-40 w-40 object-cover rounded-xl flex-shrink-0 border border-border"
                  />
                ))}
              </div>
            ) : (
              <div className="h-40 bg-muted flex items-center justify-center rounded-t-2xl">
                <Package className="size-16 text-muted-foreground/20" />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-3">
                <h3 className="text-xl font-bold">{selectedListing.title}</h3>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="size-5 text-muted-foreground" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`text-[10px] border-none ${
                    selectedListing.type === "sell"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {selectedListing.type === "sell" ? "For Sale" : "For Rent"}
                </Badge>
                <Badge variant="outline" className="text-[10px]">{selectedListing.condition}</Badge>
                <Badge variant="outline" className="text-[10px]">{selectedListing.category}</Badge>
              </div>
              <p className="text-2xl font-bold text-primary">
                LKR {Number(selectedListing.amount).toLocaleString()}
                {selectedListing.type === "rent" && (
                  <span className="text-sm font-normal text-muted-foreground"> / {selectedListing.rentPeriod}</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{selectedListing.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" /><span>{selectedListing.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" /><span>Posted {selectedListing.postedAt}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4" /><span>{selectedListing.contactNumber}</span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => alert(`Contact the seller at: ${selectedListing.contactNumber}`)}
                >
                  <Tag className="mr-2 size-4" />
                  {selectedListing.type === "sell" ? "Buy Now" : "Hire Now"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setSelectedListing(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Seller Prompt Modal ── */}
      {showSellerPrompt && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowSellerPrompt(false)}
        >
          <div
            className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">List an Item</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Do you have a seller account?
                </p>
              </div>
              <button
                onClick={() => setShowSellerPrompt(false)}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full"
                onClick={() => { setShowSellerPrompt(false); onNavigate?.("seller-register"); }}
              >
                Login to Seller Account
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setShowSellerPrompt(false); onNavigate?.("seller-register"); }}
              >
                Create a Seller Account
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
