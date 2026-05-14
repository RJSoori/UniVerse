import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import {
  ShoppingBag, Phone, Tag, Package,
  ArrowLeft, Store, User, ShieldCheck, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { getSellerById, getItemsBySeller, type SellerResponse, type MarketplaceItemResponse } from "./marketplaceApi";

/**
 * Seller Profile Component
 * Displays a public seller profile with store information and their marketplace listings
 */

interface SellerProfileProps {
  sellerEmail: string;
  sellerId: number;
  onBack: () => void;
  onViewListing: (listing: MarketplaceItemResponse) => void;
}

export function SellerProfile({ sellerId, onBack, onViewListing }: SellerProfileProps) {
  // Stores seller profile information retrieved from backend
  const [seller, setSeller] = useState<SellerResponse | null>(null);
  // Stores all items listed by this seller
  const [listings, setListings] = useState<MarketplaceItemResponse[]>([]);
  // Tracks data loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches seller profile and their complete inventory in parallel
    const fetchData = async () => {
      try {
        const [sellerData, itemsData] = await Promise.all([
          getSellerById(sellerId),
          getItemsBySeller(sellerId),
        ]);
        setSeller(sellerData);
        setListings(itemsData);
      } catch (error) {
        toast.error("Failed to load seller profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <ShoppingBag className="size-12 mx-auto opacity-20 animate-pulse" />
        <p className="text-muted-foreground">Loading seller profile...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-4">
        <ShoppingBag className="size-12 mx-auto opacity-20" />
        <p className="font-semibold text-lg">Seller not found</p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 size-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Back button ── */}
      <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" /> Back to Marketplace
      </Button>

      {/* ── Store header card ── */}
      <Card className="overflow-hidden border-primary/20 shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="absolute -top-12 left-6">
            <div className="size-24 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
              <ShoppingBag className="size-10 text-primary/40" />
            </div>
          </div>

          <div className="pt-16 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {seller.storeName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-700 border-none text-[10px]">
                    <ShieldCheck className="size-3 mr-1" /> Verified Seller
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <Store className="size-3 mr-1" /> UniVerse Seller
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => toast.info(`Contact this seller at: ${seller.phone || seller.email}`)}
                className="shrink-0"
              >
                <Phone className="mr-2 size-4" /> Contact Seller
              </Button>
            </div>

            {seller.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {seller.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
              {seller.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-4 text-primary/60" />
                  <span>{seller.phone}</span>
                </div>
              )}
              {seller.email && (
                <div className="flex items-center gap-1.5">
                  <User className="size-4 text-primary/60" />
                  <span>{seller.email}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Listings ── */}
      <div className="space-y-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBag className="size-5 text-primary" />
          Listings by this seller
          <Badge variant="secondary" className="ml-1">{listings.length}</Badge>
        </CardTitle>

        {listings.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl">
            <Package className="size-10 mx-auto mb-3 opacity-20" />
            <p className="font-semibold">No listings yet</p>
            <p className="text-sm">This seller hasn't posted anything yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:border-primary/40 transition-all border-border/60 cursor-pointer group"
                onClick={() => onViewListing(listing)}
              >
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.itemName}
                        className="size-14 rounded-xl object-cover border border-border flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="size-7 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold">{listing.itemName}</h4>
                        <Badge className={`text-[10px] border-none ${listing.type === "SELL" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                          {listing.type === "SELL" ? "For Sale" : "For Rent"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px]">{listing.condition}</Badge>
                        <Badge variant="outline" className="text-[9px]">{listing.status}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary">
                      LKR {listing.price.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}