import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import {
  ShoppingBag, MapPin, Phone, Tag, Package,
  ArrowLeft, Store, User, Clock, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { readJsonFromLocalStorage } from "../../shared/storage/localStorageJson";

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
  sellerEmail?: string;
}

interface SellerAccount {
  password?: string;
  sellerType?: string;
  businessName?: string;
  idNumber?: string;
  contactNumber?: string;
  location?: string;
  categoryFocus?: string;
  storeDescription?: string;
}

interface SellerProfileProps {
  sellerEmail: string;
  onBack: () => void;
  onViewListing: (listing: Listing) => void;
}

function getSellerAccount(email: string): SellerAccount | null {
  const accounts = readJsonFromLocalStorage<Record<string, SellerAccount>>("universe-seller-accounts", {});
  return accounts[email.toLowerCase()] || null;
}

function getSellerListings(email: string): Listing[] {
  const all = readJsonFromLocalStorage<Listing[]>("universe-listings", []);
  return all.filter((l) => l.sellerEmail?.toLowerCase() === email.toLowerCase());
}

function getSellerLogo(email: string): string | null {
  return localStorage.getItem(`universe-seller-logo-${email}`) || null;
}

export function SellerProfile({ sellerEmail, onBack, onViewListing }: SellerProfileProps) {
  const account = getSellerAccount(sellerEmail);
  const listings = getSellerListings(sellerEmail);
  const logo = getSellerLogo(sellerEmail);

  if (!account) {
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
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />

        <CardContent className="relative pt-0 pb-6 px-6">
          {/* Logo */}
          <div className="absolute -top-12 left-6">
            <div className="size-24 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
              {logo ? (
                <img src={logo} alt="Store logo" className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="size-10 text-primary/40" />
              )}
            </div>
          </div>

          {/* Store info */}
          <div className="pt-16 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  {account.businessName || "Unknown Store"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-green-100 text-green-700 border-none text-[10px]">
                    <ShieldCheck className="size-3 mr-1" /> Verified Seller
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {account.sellerType === "shop" ? (
                      <><Store className="size-3 mr-1" /> Shop / Business</>
                    ) : (
                      <><User className="size-3 mr-1" /> Individual</>
                    )}
                  </Badge>
                </div>
              </div>
              <Button
                onClick={() => toast.info(`Contact this seller at: ${account.contactNumber}`)}
                className="shrink-0"
              >
                <Phone className="mr-2 size-4" /> Contact Seller
              </Button>
            </div>

            {account.storeDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {account.storeDescription}
              </p>
            )}

            {/* Details row */}
            <div className="flex flex-wrap gap-4 pt-1 text-sm text-muted-foreground">
              {account.contactNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="size-4 text-primary/60" />
                  <span>{account.contactNumber}</span>
                </div>
              )}
              {account.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary/60" />
                  <span>{account.location}</span>
                </div>
              )}
              {account.categoryFocus && (
                <div className="flex items-center gap-1.5">
                  <Tag className="size-4 text-primary/60" />
                  <span>{account.categoryFocus}</span>
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
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="size-14 rounded-xl object-cover border border-border flex-shrink-0 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="size-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Package className="size-7 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold">{listing.title}</h4>
                        <Badge className={`text-[10px] border-none ${listing.type === "sell" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>
                          {listing.type === "sell" ? "For Sale" : "For Rent"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-xs text-muted-foreground">{listing.category}</p>
                        <Badge variant="outline" className="text-[9px]">{listing.condition}</Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="size-3" /> Posted {listing.postedAt}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-primary">
                      LKR {Number(listing.amount).toLocaleString()}
                    </p>
                    {listing.type === "rent" && (
                      <p className="text-[10px] text-muted-foreground">/ {listing.rentPeriod}</p>
                    )}
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
