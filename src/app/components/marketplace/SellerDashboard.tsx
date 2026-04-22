import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Plus, Trash2, ShoppingBag, Package, BarChart3,
  Clock, LogOut, Settings, Tag, ImagePlus, X,
  CheckCircle,
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

interface SellerDashboardProps {
  onNavigate: (id: string) => void;
}

const CONDITIONS = ["Brand New", "Like New", "Good", "Fair", "For Parts"];
const CATEGORIES = [
  "Textbooks & Notes", "Electronics", "Clothing & Accessories",
  "Furniture", "Sports & Fitness", "Stationery",
  "Food & Drinks", "Services", "Other",
];
const RENT_PERIODS = ["Per Day", "Per Week", "Per Month", "Per Semester"];

const emptyForm = {
  title: "",
  description: "",
  type: "sell" as "sell" | "rent",
  amount: "",
  rentPeriod: "Per Day",
  condition: "",
  category: "",
  contactNumber: "",
  location: "",
  images: [] as string[],
};

export default function SellerDashboard({ onNavigate }: SellerDashboardProps) {
  const [listings, setListings] = useState<Listing[]>(() =>
    JSON.parse(localStorage.getItem("universe-listings") || "[]")
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (form.images.length + files.length > 5) {
      setFormError("You can upload a maximum of 5 images.");
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ev.target?.result as string],
        }));
      };
      reader.readAsDataURL(file);
    });
    setFormError("");
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.description || !form.amount || !form.condition || !form.category || !form.contactNumber || !form.location) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }
    if (!/^\d{7,15}$/.test(form.contactNumber.replace(/\s/g, ""))) {
      setFormError("Please enter a valid contact number.");
      return;
    }
    const newListing: Listing = {
      id: String(Date.now()),
      ...form,
      postedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };
    const updated = [newListing, ...listings];
    setListings(updated);
    localStorage.setItem("universe-listings", JSON.stringify(updated));
    setForm(emptyForm);
    setShowForm(false);
    setFormError("");
  };

  const deleteListing = (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      const updated = listings.filter((l) => l.id !== id);
      setListings(updated);
      localStorage.setItem("universe-listings", JSON.stringify(updated));
    }
  };

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
              <h2 className="text-2xl font-black tracking-tight uppercase">Seller Hub</h2>
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
            <Button variant="outline" size="sm" className="flex-1 md:flex-none">
              <Settings className="mr-2 size-4" /> Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/5"
              onClick={() => onNavigate("signup")}
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
                <Label>Listing Title <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Calculus Textbook – 3rd Edition"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Description <span className="text-destructive">*</span></Label>
                <textarea
                  rows={3}
                  placeholder="Describe your item — condition details, reason for selling, any flaws..."
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
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Listing Type <span className="text-destructive">*</span></Label>
                <div className="flex gap-3">
                  {(["sell", "rent"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        form.type === t
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:border-primary text-muted-foreground"
                      }`}
                    >
                      {t === "sell" ? "For Sale" : "For Rent"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label>Amount (LKR) <span className="text-destructive">*</span></Label>
                  <Input
                    type="number"
                    placeholder="e.g. 1500"
                    min={0}
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                {form.type === "rent" && (
                  <div className="flex-1 space-y-1">
                    <Label>Rent Period</Label>
                    <select
                      value={form.rentPeriod}
                      onChange={(e) => setForm({ ...form, rentPeriod: e.target.value })}
                      className="w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    >
                      {RENT_PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label>Location / Pickup Point <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="e.g. Faculty of Engineering, Block A"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Contact Number <span className="text-destructive">*</span></Label>
                <Input
                  type="tel"
                  placeholder="e.g. 0771234567"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Images <span className="text-muted-foreground text-xs font-normal">(max 5)</span>
                </Label>
                <div className="flex flex-wrap gap-3">
                  {form.images.map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 hover:bg-destructive transition-colors"
                      >
                        <X className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {form.images.length < 5 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors text-muted-foreground hover:text-primary"
                    >
                      <ImagePlus className="size-5" />
                      <span className="text-[10px]">Add Photo</span>
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                <p className="text-xs text-muted-foreground">{form.images.length}/5 images added</p>
              </div>

              {formError && <p className="text-xs text-destructive">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={handleSubmit}>
                  <CheckCircle className="mr-2 size-4" /> Post Listing
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
              <Clock className="size-5 text-primary" /> Recent Listings
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
                        {listing.images.length > 0 ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="size-14 rounded-xl object-cover border border-border flex-shrink-0"
                          />
                        ) : (
                          <div className="size-14 bg-muted rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors flex-shrink-0">
                            <Package className="size-7 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-xl font-bold">{listing.title}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {listing.type === "sell" ? "For Sale" : "For Rent"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {listing.condition}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {listing.category}
                            </Badge>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-2">
                              <Clock className="size-3" /> Posted {listing.postedAt}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-primary mt-1">
                            LKR {Number(listing.amount).toLocaleString()}
                            {listing.type === "rent" && (
                              <span className="text-xs font-normal text-muted-foreground"> / {listing.rentPeriod}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-destructive hover:bg-destructive/10"
                          onClick={() => deleteListing(listing.id)}
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
