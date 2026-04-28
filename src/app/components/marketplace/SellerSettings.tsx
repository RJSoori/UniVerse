import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  ArrowLeft, Save, ShoppingBag, MapPin, Tag,
  ShieldCheck, Camera, Bell, Lock, Phone,
  Eye, EyeOff, X, CheckCircle, AlertTriangle,
  ToggleLeft, ToggleRight,
} from "lucide-react";

interface SellerSettingsProps {
  onBack: () => void;
}

type ActiveTab = "store" | "notifications" | "security";

// ── Read/write account from localStorage ─────────────────────────────────────
function getActiveEmail(): string {
  const activeSeller = localStorage.getItem("universe-active-seller");
  if (activeSeller) {
    return activeSeller.toLowerCase();
  }
  try {
    const raw = localStorage.getItem("universe-seller-accounts") || "{}";
    const accounts = JSON.parse(raw);
    return Object.keys(accounts)[0] || "";
  } catch { return ""; }
}

function getAccount(email: string) {
  if (!email) return null;
  try {
    const accounts = JSON.parse(localStorage.getItem("universe-seller-accounts") || "{}");
    return accounts[email.toLowerCase()] || null;
  } catch { return null; }
}

function saveAccount(email: string, data: Record<string, string>) {
  if (!email) return;
  try {
    const accounts = JSON.parse(localStorage.getItem("universe-seller-accounts") || "{}");
    accounts[email.toLowerCase()] = { ...accounts[email.toLowerCase()], ...data };
    localStorage.setItem("universe-seller-accounts", JSON.stringify(accounts));
  } catch { /* ignore */ }
}
// ─────────────────────────────────────────────────────────────────────────────

export function SellerSettings({ onBack }: SellerSettingsProps) {
  const email = getActiveEmail();
  const account = getAccount(email);

  const [activeTab, setActiveTab] = useState<ActiveTab>("store");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Logo state ─────────────────────────────────────────────────────────────
  const [logoPreview, setLogoPreview] = useState<string | null>(
    localStorage.getItem("universe-seller-logo") || null
  );
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoPreview(result);
      localStorage.setItem("universe-seller-logo", result);
    };
    reader.readAsDataURL(file);
  };

  // ── Store info state — pre-filled from localStorage ────────────────────────
  const [storeName, setStoreName] = useState(account?.businessName || "");
  const [sellerType, setSellerType] = useState(account?.sellerType || "");
  const [sellerIdNumber, setSellerIdNumber] = useState(account?.idNumber || "");
  const [categoryFocus, setCategoryFocus] = useState(account?.categoryFocus || "");
  const [storeDescription, setStoreDescription] = useState(account?.storeDescription || "");
  const [contactNumber, setContactNumber] = useState(account?.contactNumber || "");
  const [location, setLocation] = useState(account?.location || "");

  // ── Notifications state ────────────────────────────────────────────────────
  const [notifNewMessage, setNotifNewMessage] = useState(true);
  const [notifNewOffer, setNotifNewOffer] = useState(true);
  const [notifListingExpiry, setNotifListingExpiry] = useState(false);
  const [notifPlatformUpdates, setNotifPlatformUpdates] = useState(true);

  // ── Security state ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // ── Re-verification state ──────────────────────────────────────────────────
  const [showReverifyModal, setShowReverifyModal] = useState(false);
  const [reverifyReason, setReverifyReason] = useState("");
  const [reverifySubmitted, setReverifySubmitted] = useState(false);

  // ── Save store info back to localStorage ──────────────────────────────────
  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    // Save updated fields back — when you add a backend, replace this with an API call
    saveAccount(email, {
      sellerType,
      idNumber: sellerIdNumber,
      businessName: storeName,
      categoryFocus,
      storeDescription,
      contactNumber,
      location,
    });
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handlePasswordChange = () => {
    setPasswordError("");
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all fields.");
      return;
    }
    if (account?.password && account.password !== currentPassword) {
      setPasswordError("Current password is incorrect.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    saveAccount(email, { password: newPassword });
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleReverifySubmit = () => {
    if (!reverifyReason.trim()) return;
    setReverifySubmitted(true);
    setTimeout(() => {
      setShowReverifyModal(false);
      setReverifySubmitted(false);
      setReverifyReason("");
    }, 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange} className="text-muted-foreground hover:text-primary transition-colors">
      {value
        ? <ToggleRight className="size-8 text-primary" />
        : <ToggleLeft className="size-8" />}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-right-4 duration-500">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tight">Seller Settings</h2>
            <p className="text-muted-foreground">Manage your store profile and account security.</p>
          </div>
        </div>
        {activeTab === "store" && (
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="size-3" /> Saved
              </span>
            )}
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"} <Save className="ml-2 size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Left column ── */}
        <div className="md:col-span-1 space-y-4">
          <Card className="overflow-hidden border-primary/10">
            <div className="h-24 bg-primary/10 w-full" />
            <CardContent className="relative pt-12 pb-6 text-center">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                <div
                  className="size-24 rounded-2xl bg-background border-4 border-background shadow-xl flex items-center justify-center overflow-hidden group cursor-pointer relative"
                  onClick={() => logoInputRef.current?.click()}
                >
                  {logoPreview ? (
                    <>
                      <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                      <div className="hidden group-hover:flex absolute flex-col items-center text-primary">
                        <Camera className="size-6" />
                        <span className="text-[10px] font-bold">Change</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="size-10 text-muted-foreground group-hover:hidden" />
                      <div className="hidden group-hover:flex flex-col items-center text-primary">
                        <Camera className="size-6" />
                        <span className="text-[10px] font-bold">Upload</span>
                      </div>
                    </>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
              <h3 className="font-bold text-lg">Store Logo</h3>
              <p className="text-xs text-muted-foreground">Click to upload. Visible to buyers.</p>
              {logoPreview && (
                <button
                  onClick={() => {
                    setLogoPreview(null);
                    localStorage.removeItem("universe-seller-logo");
                  }}
                  className="mt-2 text-xs text-destructive hover:underline"
                >
                  Remove logo
                </button>
              )}
            </CardContent>
          </Card>

          <nav className="flex flex-col gap-1">
            <Button variant={activeTab === "store" ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab("store")}>
              <ShoppingBag className="mr-2 size-4" /> Store Info
            </Button>
            <Button variant={activeTab === "notifications" ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab("notifications")}>
              <Bell className="mr-2 size-4" /> Notifications
            </Button>
            <Button variant={activeTab === "security" ? "secondary" : "ghost"} className="justify-start" onClick={() => setActiveTab("security")}>
              <Lock className="mr-2 size-4" /> Security
            </Button>
          </nav>
        </div>

        {/* ── Right column ── */}
        <div className="md:col-span-2 space-y-6">

          {/* ── Store Info tab ── */}
          {activeTab === "store" && (
            <>
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="text-lg">Store Profile</CardTitle>
                  <CardDescription>
                    Pre-filled from your registration. Edit and save to update.
                    {/* When backend is ready: replace localStorage reads/writes with API calls */}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Store / Display Name</Label>
                      <Input
                        placeholder="e.g. Jane's Handmade Crafts"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Seller Type</Label>
                      <Input
                        placeholder="Shop / Individual"
                        value={sellerType === "shop" ? "Shop / Business" : sellerType === "individual" ? "Individual" : "Not selected"}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category Focus</Label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g. Textbooks, Electronics"
                          value={categoryFocus}
                          onChange={(e) => setCategoryFocus(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{sellerType === "shop" ? "Business Registration ID" : "NIC / Student ID"}</Label>
                      <Input
                        placeholder={sellerType === "shop" ? "e.g. PV-XXXXXX" : "e.g. 200XXXXXXXXX"}
                        value={sellerIdNumber}
                        onChange={(e) => setSellerIdNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Store Description</Label>
                    <Textarea
                      className="min-h-[100px] resize-none border border-border/70 bg-muted/20 rounded-xl px-4 py-3 focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:border-primary/50 transition-colors"
                      placeholder="Describe what you sell and why students should buy from you..."
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g. 0771234567"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Pickup / Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          className="pl-10"
                          placeholder="e.g. Faculty of Engineering"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive flex items-center gap-2">
                    <ShieldCheck className="size-5" /> Account Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-700 border-none text-xs">Verified</Badge>
                    <p className="text-sm text-muted-foreground">Your seller account is currently verified.</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Changed your store details or identity? Submit a re-verification request and the UniVerse team will review it.
                  </p>
                  <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => setShowReverifyModal(true)}>
                    <AlertTriangle className="mr-2 size-4" /> Request Re-verification
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Notifications tab ── */}
          {activeTab === "notifications" && (
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Notification Preferences</CardTitle>
                <CardDescription>Choose what you want to be notified about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0 divide-y divide-border">
                {[
                  { label: "New Message", desc: "When a buyer sends you a message about a listing", value: notifNewMessage, toggle: () => setNotifNewMessage(!notifNewMessage) },
                  { label: "New Offer", desc: "When a buyer makes an offer on your listing", value: notifNewOffer, toggle: () => setNotifNewOffer(!notifNewOffer) },
                  { label: "Listing Expiry", desc: "Reminder when a listing is about to expire", value: notifListingExpiry, toggle: () => setNotifListingExpiry(!notifListingExpiry) },
                  { label: "Platform Updates", desc: "News and updates from the UniVerse team", value: notifPlatformUpdates, toggle: () => setNotifPlatformUpdates(!notifPlatformUpdates) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.toggle} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* ── Security tab ── */}
          {activeTab === "security" && (
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Change Password</CardTitle>
                <CardDescription>Update your seller account password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(""); setPasswordSuccess(false); }}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                      {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); setPasswordSuccess(false); }}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                      {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); setPasswordSuccess(false); }}
                  />
                </div>
                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="size-4" /> Password updated successfully.
                  </div>
                )}
                <Button className="w-full" onClick={handlePasswordChange}>
                  <Lock className="mr-2 size-4" /> Update Password
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Re-verification Modal ── */}
      {showReverifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReverifyModal(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Request Re-verification</h3>
                <p className="text-sm text-muted-foreground mt-1">Tell us what changed so we can re-verify your account.</p>
              </div>
              <button onClick={() => setShowReverifyModal(false)} className="p-1 rounded-full hover:bg-muted transition-colors">
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
            {reverifySubmitted ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle className="size-10 text-green-500" />
                <p className="font-semibold text-center">Request submitted!</p>
                <p className="text-xs text-muted-foreground text-center">The UniVerse team will review your request and get back to you.</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Reason for Re-verification</Label>
                  <Textarea
                    rows={4}
                    className="resize-none"
                    placeholder="e.g. I changed my store name and updated my business registration..."
                    value={reverifyReason}
                    onChange={(e) => setReverifyReason(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <Button className="flex-1" onClick={handleReverifySubmit} disabled={!reverifyReason.trim()}>Submit Request</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowReverifyModal(false)}>Cancel</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
