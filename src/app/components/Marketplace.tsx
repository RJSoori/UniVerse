import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, MapPin, DollarSign, User, CheckCircle2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: "buy" | "sell" | "rent";
  description: string;
  location: string;
  seller: string;
  sellerVerified: boolean;
  postedDate: string;
  image?: string;
}

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "buy" | "sell" | "rent">("all");

  // Mock marketplace data
  const listings: Listing[] = [
    {
      id: "1",
      title: "Calculus Textbook (Like New)",
      price: 45,
      category: "sell",
      description: "Barely used, excellent condition",
      location: "North Campus",
      seller: "Sarah M.",
      sellerVerified: true,
      postedDate: "2 hours ago",
    },
    {
      id: "2",
      title: "Mini Fridge for Rent",
      price: 15,
      category: "rent",
      description: "Monthly rental, clean and working",
      location: "West Dorms",
      seller: "John D.",
      sellerVerified: true,
      postedDate: "1 day ago",
    },
    {
      id: "3",
      title: "Looking for: Chemistry Lab Manual",
      price: 30,
      category: "buy",
      description: "Need for Spring semester",
      location: "South Campus",
      seller: "Emily R.",
      sellerVerified: true,
      postedDate: "3 days ago",
    },
    {
      id: "4",
      title: "Desk Lamp",
      price: 20,
      category: "sell",
      description: "Adjustable LED desk lamp",
      location: "East Campus",
      seller: "Mike T.",
      sellerVerified: true,
      postedDate: "5 hours ago",
    },
    {
      id: "5",
      title: "Bicycle for Rent",
      price: 10,
      category: "rent",
      description: "Weekly rental, great for campus",
      location: "Central Campus",
      seller: "Alex K.",
      sellerVerified: true,
      postedDate: "1 week ago",
    },
    {
      id: "6",
      title: "TI-84 Calculator",
      price: 60,
      category: "sell",
      description: "Perfect condition, with case",
      location: "North Campus",
      seller: "Lisa W.",
      sellerVerified: true,
      postedDate: "2 days ago",
    },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "sell":
        return <Badge className="bg-green-100 text-green-800">For Sale</Badge>;
      case "rent":
        return <Badge className="bg-blue-100 text-blue-800">For Rent</Badge>;
      case "buy":
        return <Badge className="bg-purple-100 text-purple-800">Wanted</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campus Marketplace</CardTitle>
          <CardDescription>Buy, sell, or rent items with verified students</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>Post Listing</Button>
          </div>

          <Tabs value={selectedCategory} onValueChange={(v: any) => setSelectedCategory(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sell">For Sale</TabsTrigger>
              <TabsTrigger value="rent">For Rent</TabsTrigger>
              <TabsTrigger value="buy">Wanted</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">No listings found</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {getCategoryBadge(listing.category)}
                      <span className="text-sm text-muted-foreground">{listing.postedDate}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="size-4 text-muted-foreground" />
                      <span className="text-2xl font-semibold">${listing.price}</span>
                      {listing.category === "rent" && (
                        <span className="text-sm text-muted-foreground">/week</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    {listing.location}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{listing.seller}</span>
                      {listing.sellerVerified && (
                        <CheckCircle2 className="size-3 text-blue-500" />
                      )}
                    </div>
                  </div>

                  <Button size="sm">
                    <MessageCircle className="mr-2 size-4" />
                    Contact
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
