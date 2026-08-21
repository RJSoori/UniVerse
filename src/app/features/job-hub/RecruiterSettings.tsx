import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Badge } from "../../shared/ui/badge";
import {
    ArrowLeft,
    Save,
    Upload,
    CheckCircle2,
    Clock,
    RefreshCw,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch, parseApiError } from "../../shared/api/client";

interface RecruiterSettingsProps {
    type: "company" | "individual" | null;
    currentRecruiter: any;
    onRecruiterUpdated: (profile: any) => void;
    onBack: () => void;
}

const STATUS_INFO: Record<string, { label: string; badgeClass: string; icon: typeof CheckCircle2; message: string }> = {
    VERIFIED: {
        label: "Verified",
        badgeClass: "bg-green-100 text-green-700 border-none",
        icon: CheckCircle2,
        message: "Your account is verified. Editing your profile or documents below will require a new re-verification before you can post jobs again.",
    },
    RE_VERIFICATION: {
        label: "Re-verification Pending",
        badgeClass: "bg-amber-100 text-amber-700 border-none",
        icon: RefreshCw,
        message: "Your recent changes are awaiting admin review. You can't post new jobs until they're approved - your existing postings are unaffected.",
    },
    PENDING: {
        label: "Pending Verification",
        badgeClass: "bg-amber-100 text-amber-700 border-none",
        icon: Clock,
        message: "Your account is awaiting its first review from our team.",
    },
    REJECTED: {
        label: "Rejected",
        badgeClass: "bg-red-100 text-red-700 border-none",
        icon: XCircle,
        message: "Your account was not approved. Contact support for more information.",
    },
};

/** One re-upload slot: shows a "View current file" link if one exists, plus a click-to-upload
 * dropzone-styled control (same pattern as SkillsManager.tsx's CV upload). */
function DocumentUploadField({
    label,
    currentUrl,
    selectedFile,
    onFileSelected,
}: {
    label: string;
    currentUrl?: string | null;
    selectedFile: File | null;
    onFileSelected: (file: File) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        e.target.value = "";
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File exceeds the maximum allowed size of 10MB.");
            return;
        }
        onFileSelected(file);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                {currentUrl && (
                    <a
                        href={currentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                    >
                        View current file
                    </a>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleChange}
            />
            <div
                className="border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors"
                onClick={() => inputRef.current?.click()}
            >
                {selectedFile ? (
                    <CheckCircle2 className="size-5 text-green-500 shrink-0" />
                ) : (
                    <Upload className="size-5 text-muted-foreground shrink-0" />
                )}
                <div className="min-w-0">
                    <p className="text-xs font-bold truncate">
                        {selectedFile ? selectedFile.name : currentUrl ? "Replace file" : "Upload file"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">PDF or image, max 10MB</p>
                </div>
            </div>
        </div>
    );
}

export function RecruiterSettings({ type, currentRecruiter, onRecruiterUpdated, onBack }: RecruiterSettingsProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<any>(currentRecruiter ?? null);

    const [companyName, setCompanyName] = useState(currentRecruiter?.companyName ?? "");
    const [contactPerson, setContactPerson] = useState(currentRecruiter?.contactPerson ?? "");

    const [businessRegistration, setBusinessRegistration] = useState<File | null>(null);
    const [orgLogo, setOrgLogo] = useState<File | null>(null);
    const [authLetter, setAuthLetter] = useState<File | null>(null);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [idDocument, setIdDocument] = useState<File | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await apiFetch("/api/jobs/recruiters/me", {
                    headers: {
                        "X-Recruiter-Token": localStorage.getItem("universe-recruiter-token") || "",
                    },
                    skipAuthRedirect: true,
                });
                if (!response.ok) {
                    throw new Error(await parseApiError(response));
                }
                const data = await response.json();
                setProfile(data);
                setCompanyName(data.companyName ?? "");
                setContactPerson(data.contactPerson ?? "");
            } catch (error) {
                console.error("Failed to load recruiter profile:", error);
                toast.error("Unable to load your profile. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, []);

    const accountType = profile?.accountType || type;
    const status = profile?.status as string | undefined;
    const statusInfo = STATUS_INFO[status ?? ""] ?? {
        label: "Unknown",
        badgeClass: "bg-muted text-muted-foreground border-none",
        icon: AlertTriangle,
        message: "We couldn't determine your account status.",
    };
    const StatusIcon = statusInfo.icon;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append("companyName", companyName);
            formData.append("contactPerson", contactPerson);
            if (businessRegistration) formData.append("businessRegistration", businessRegistration);
            if (orgLogo) formData.append("orgLogo", orgLogo);
            if (authLetter) formData.append("authLetter", authLetter);
            if (profilePicture) formData.append("profilePicture", profilePicture);
            if (idDocument) formData.append("idDocument", idDocument);

            const response = await apiFetch("/api/jobs/recruiters/me", {
                method: "PUT",
                headers: {
                    "X-Recruiter-Token": localStorage.getItem("universe-recruiter-token") || "",
                },
                body: formData,
                skipAuthRedirect: true,
            });
            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }
            const updated = await response.json();
            setProfile(updated);
            setBusinessRegistration(null);
            setOrgLogo(null);
            setAuthLetter(null);
            setProfilePicture(null);
            setIdDocument(null);
            onRecruiterUpdated(updated);

            if (updated.status === "RE_VERIFICATION" && status !== "RE_VERIFICATION") {
                toast.success(
                    "Profile updated. Your account now needs re-verification before you can post new jobs.",
                );
            } else {
                toast.success("Profile settings updated successfully.");
            }
        } catch (error) {
            console.error("Failed to save recruiter profile:", error);
            toast.error(
                error instanceof Error ? error.message : "Unable to save your changes. Please try again.",
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto py-24 text-center text-muted-foreground">
                Loading your profile...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
                        <ArrowLeft className="size-5" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight">Portal Settings</h2>
                        <p className="text-muted-foreground">Manage your recruitment profile and verification documents.</p>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"} <Save className="ml-2 size-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Card className="border-primary/10">
                        <CardContent className="pt-6 space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Email</p>
                                <p className="text-sm font-bold break-all">{profile?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Account Type</p>
                                <p className="text-sm font-bold capitalize">{accountType}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={status === "VERIFIED" ? "border-primary/10" : "border-amber-300/50 bg-amber-50/40"}>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <StatusIcon className="size-4" /> Account Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
                            <p className="text-xs text-muted-foreground">{statusInfo.message}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Public Profile</CardTitle>
                            <CardDescription>This information is displayed on your job postings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Company / Display Name</Label>
                                    <Input
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Organization or Personal Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Contact Person</Label>
                                    <Input
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="Full name"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-lg">Verification Documents</CardTitle>
                            <CardDescription>
                                Replacing any document below will send your account for re-verification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {accountType === "individual" ? (
                                <>
                                    <DocumentUploadField
                                        label="Profile Picture"
                                        currentUrl={profile?.profilePictureUrl}
                                        selectedFile={profilePicture}
                                        onFileSelected={setProfilePicture}
                                    />
                                    <DocumentUploadField
                                        label="Personal ID"
                                        currentUrl={profile?.idDocumentUrl}
                                        selectedFile={idDocument}
                                        onFileSelected={setIdDocument}
                                    />
                                </>
                            ) : (
                                <>
                                    <DocumentUploadField
                                        label="Business Registration"
                                        currentUrl={profile?.businessRegistrationUrl}
                                        selectedFile={businessRegistration}
                                        onFileSelected={setBusinessRegistration}
                                    />
                                    <DocumentUploadField
                                        label="Organization Logo"
                                        currentUrl={profile?.orgLogoUrl}
                                        selectedFile={orgLogo}
                                        onFileSelected={setOrgLogo}
                                    />
                                    <DocumentUploadField
                                        label="Authorization Letter"
                                        currentUrl={profile?.authLetterUrl}
                                        selectedFile={authLetter}
                                        onFileSelected={setAuthLetter}
                                    />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
