import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  ShoppingBag,
  Plus,
  Trash2,
  MessageSquare,
  Sparkles,
  X,
  Search,
  Filter
} from "lucide-react";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: "textbooks" | "electronics" | "furniture" | "other";
  condition: string;
  description: string;
}

export function Marketplace() {
  const [listings, setListings] = useUniStorage<Listing[]>("uni-marketplace", []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [newListing, setNewListing] = useState<Omit<Listing, "id">>({
    title: "",
    price: 0,
    category: "textbooks",
    condition: "Good",
    description: "",
  });

  // Filtering Logic
  const filteredListings = listings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCat === "all" || item.category === filterCat;
    return matchesSearch && matchesCategory;
  });

  const addListing = () => {
    if (!newListing.title || newListing.price <= 0) return;
    const entry: Listing = {
      id: Date.now().toString(),
      ...newListing,
    };
    setListings([entry, ...listings]);
    setNewListing({ title: "", price: 0, category: "textbooks", condition: "Good", description: "" });
    setShowAddForm(false);
  };

  return (
      <div className="space-y-6 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
            <p className="text-muted-foreground text-sm">Intelligent campus trading community</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="w-fit">
            <Plus className="mr-2 h-4 w-4" /> List New Item
          </Button>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div className="flex flex-col sm:flex-row gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search textbooks, laptops, furniture..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative flex items-center">
              <Filter className="absolute left-3 h-3 w-3 text-muted-foreground pointer-events-none" />
              <select
                  className="pl-8 pr-4 py-2 border rounded-md bg-background text-sm appearance-none focus:ring-1 focus:ring-primary outline-none"
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="textbooks">Textbooks</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <section className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-primary">UniVerse Recommender: Items you missed</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-background p-3 rounded-lg border border-primary/10 flex justify-between items-center shadow-sm">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold">Scientific Calculator FX-991ES</p>
                <p className="text-[10px] text-muted-foreground italic">Searched 2 days ago • High Demand</p>
              </div>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 cursor-pointer hover:bg-orange-100">
                Notify Me
              </Badge>
            </div>
          </div>
        </section>

        {/* Add Item Form */}
        {showAddForm && (
            <Card className="border-primary/20 shadow-lg animate-in fade-in zoom-in duration-200">
              <CardHeader><CardTitle className="text-lg">List a New Item</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input value={newListing.title} onChange={(e) => setNewListing({...newListing, title: e.target.value})} placeholder="e.g. Mechanical Keyboard" />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (LKR)</Label>
                    <Input type="number" value={newListing.price || ""} onChange={(e) => setNewListing({...newListing, price: parseFloat(e.target.value)})} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addListing} className="flex-1">Post Listing</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredListings.length === 0 ? (
              <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                No items match your search. Try a different keyword or category.
              </div>
          ) : (
              filteredListings.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all border-border/60">
                    <div className="aspect-video bg-muted/30 flex items-center justify-center relative">
                      <ShoppingBag className="h-10 w-10 text-primary/10" />
                      <Badge className="absolute top-2 right-2 bg-background/80 text-foreground backdrop-blur-sm border-none shadow-sm">{item.condition}</Badge>
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="text-[10px] font-bold uppercase">{item.category}</Badge>
                        <span className="font-bold text-primary">LKR {item.price.toLocaleString()}</span>
                      </div>
                      <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex gap-2">
                      <Button size="sm" variant="default" className="flex-1" onClick={() => setActiveChat(item.title)}>
                        <MessageSquare className="mr-2 h-3 w-3" /> Chat with Seller
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setListings(listings.filter(l => l.id !== item.id))} className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>

        {/* --- IN-APP CHAT OVERLAY --- */}
        {activeChat && (
            <div className="fixed bottom-4 right-4 w-80 bg-background border rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-5">
              <div className="bg-primary p-3 text-primary-foreground flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs font-bold truncate">Chat: {activeChat}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-white/20" onClick={() => setActiveChat(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-56 p-4 bg-muted/10 overflow-y-auto flex flex-col gap-2">
                <div className="bg-primary/10 p-2 rounded-lg text-[11px] max-w-[85%] self-start">
                  Hi! I'm interested in this item. Is the price negotiable?
                </div>
                <div className="text-[9px] text-center text-muted-foreground my-2">
                  AI Insight: Seller usually responds within 1 hour
                </div>
              </div>
              <div className="p-2 border-t flex gap-2 bg-background">
                <Input placeholder="Type your message..." className="h-8 text-xs flex-1" />
                <Button size="sm" className="h-8">Send</Button>
              </div>
            </div>
        )}
      </div>
  );
}