import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Building2, User, ArrowLeft, ShieldCheck, Mail } from "lucide-react";

interface AccessRecoveryProps {
    onBack: () => void;
}

export function AccessRecovery({ onBack }: AccessRecoveryProps) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [userType, setUserType] = useState<"company" | "individual" | null>(null);
    const [verificationValue, setVerificationValue] = useState("");

    const handleCheckEmail = () => {
        if (!email.includes("@")) {
            alert("Please enter a valid registered email.");
            return;
        }
        // Mock Logic: Determining type based on email for simulation
        // In a real app, this would be an API call to your database
        const determinedType = email.includes("corp") || email.includes("hr") ? "company" : "individual";
        setUserType(determinedType);
        setStep(2);
    };

    const handleFinalVerify = () => {
        if (verificationValue.length < 5) {
            alert(`Please enter a valid ${userType === 'company' ? 'BR Number' : 'NIC Number'}.`);
            return;
        }
        alert("Verification successful! A temporary access key has been sent to your email.");
        onBack();
    };

    return (
        <div className="max-w-md mx-auto pt-10">
            <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="mb-4 text-muted-foreground hover:text-primary"
            >
                <ArrowLeft className="mr-2 size-4" /> Back to Login
            </Button>

            <Card className="border-primary/20 shadow-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="text-primary size-6" />
                    </div>
                    <CardTitle>Account Recovery</CardTitle>
                    <CardDescription>Verify your identity to recover access</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Registered Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button className="w-full" onClick={handleCheckEmail}>Identify Account Type</Button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                            <div className="p-3 bg-muted rounded-lg flex items-center gap-3 border">
                                {userType === "company" ? (
                                    <Building2 className="size-5 text-primary" />
                                ) : (
                                    <User className="size-5 text-primary" />
                                )}
                                <div className="text-sm">
                                    <p className="font-bold">Account Type Identified</p>
                                    <p className="text-muted-foreground capitalize">{userType} Profile</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    {userType === "company" ? "Business Registration (BR) Number" : "NIC / Passport Number"}
                                </Label>
                                <Input
                                    placeholder={userType === "company" ? "e.g. PV-123456" : "e.g. 199912345678"}
                                    value={verificationValue}
                                    onChange={(e) => setVerificationValue(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleFinalVerify}>Verify & Recover</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}