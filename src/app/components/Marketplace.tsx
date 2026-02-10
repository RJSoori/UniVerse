import { useState } from "react";
import { useUniStorage } from "../hooks/useUniStorage";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ShoppingBag, Plus, Trash2, MessageSquare } from "lucide-react";

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListing, setNewListing] = useState<Omit<Listing, "id">>({
    title: "",
    price: 0,
    category: "textbooks",
    condition: "Good",
    description: "",
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

  const deleteListing = (id: string) => {
    setListings(listings.filter((l) => l.id !== id));
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Marketplace</h2>
            <p className="text-muted-foreground text-sm">Buy and sell within the campus community</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" /> List Item
          </Button>
        </div>

        {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input
                        placeholder="e.g. Engineering Mathematics Textbook"
                        value={newListing.title}
                        onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (LKR)</Label>
                    <Input
                        type="number"
                        value={newListing.price || ""}
                        onChange={(e) => setNewListing({...newListing, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                        className="w-full p-2 border rounded-md bg-background text-sm"
                        value={newListing.category}
                        onChange={(e) => setNewListing({...newListing, category: e.target.value as any})}
                    >
                      <option value="textbooks">Textbooks</option>
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Input
                        placeholder="e.g. Like New, Used"
                        value={newListing.condition}
                        onChange={(e) => setNewListing({...newListing, condition: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addListing} className="flex-1">Post Listing</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.length === 0 ? (
              <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                No items listed yet. Be the first to post!
              </div>
          ) : (
              listings.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="text-[10px] uppercase">{item.category}</Badge>
                        <span className="font-bold text-primary">LKR {item.price.toLocaleString()}</span>
                      </div>
                      <CardTitle className="text-lg mt-1">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Condition: {item.condition}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1">
                          <MessageSquare className="mr-2 h-3 w-3" /> Contact
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteListing(item.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
              ))
          )}
        </div>
      </div>
  );
}