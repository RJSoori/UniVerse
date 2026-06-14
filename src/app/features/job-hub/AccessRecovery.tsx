import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface AccessRecoveryProps {
    onBack: () => void;
}

export function AccessRecovery({ onBack }: AccessRecoveryProps) {
    return (
        <div className="max-w-md mx-auto pt-20">
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
                    <CardDescription>Need help accessing your account?</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Password reset is not yet available through this portal.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Please contact support at{" "}
                        <span className="font-medium text-foreground">support@universe.edu</span>{" "}
                        with your registered email address and we will assist you within 1–2 business days.
                    </p>
                    <Button variant="outline" className="w-full" onClick={onBack}>
                        Back to Login
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
