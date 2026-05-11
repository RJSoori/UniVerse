import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../shared/ui/card";
import { apiFetch, parseApiError } from "../../shared/api/client";
import { Button } from "../../shared/ui/button";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../shared/ui/tabs";
import { Textarea } from "../../shared/ui/textarea";
import {
  Building2,
  User,
  Upload,
  ArrowLeft,
  GraduationCap,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  FileText,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AccessRecovery } from "./AccessRecovery";
import { JobPosting } from "./JobPosting";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { RecruiterSettings } from "./RecruiterSettings";

export function JobRegistration() {
  const navigate = useNavigate();

  // ===== USER INTERFACE STATE MANAGEMENT =====
  // Controls the overall authentication flow and UI navigation
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isSettings, setIsSettings] = useState(false);

  // Password visibility toggles for better UX
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);

  // Registration flow state
  const [isRegistering, setIsRegistering] = useState(false);

  // ===== FORM DATA STATE =====
  // Core authentication credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Multi-step registration wizard state
  const [step, setStep] = useState(1);
  const [type, setType] = useState<"company" | "individual" | null>(null);

  // Backend synchronization state
  const [isRegistered, setIsRegistered] = useState(false);
  const [currentRecruiter, setCurrentRecruiter] = useState<any>(null);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // ===== REGISTRATION DOCUMENT UPLOAD STATE =====
  // Required verification documents for company registration
  const [businessRegistration, setBusinessRegistration] = useState<File | null>(
    null,
  );
  const [orgLogo, setOrgLogo] = useState<File | null>(null);
  const [authLetter, setAuthLetter] = useState<File | null>(null);

  // Company details for registration
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // ===== PASSWORD SECURITY VALIDATION =====
  // Evaluates password strength based on length and character diversity
  // Returns visual feedback for user experience
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null;
    if (pwd.length < 6)
      return { level: "weak", color: "bg-red-500", label: "Too short" };
    if (pwd.length < 8)
      return { level: "fair", color: "bg-orange-400", label: "Fair" };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 8)
      return { level: "strong", color: "bg-green-500", label: "Strong" };
    return { level: "good", color: "bg-blue-400", label: "Good" };
  };

  // Real-time password validation state
  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  // ===== AUTHENTICATION & API COMMUNICATION =====
  // Handles recruiter login with backend validation and status checking
  const handleLogin = async () => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const response = await fetch(
        "http://localhost:8080/api/jobs/recruiters/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            email: normalizedEmail,
            password: password,
          }).toString(),
        },
      );

      if (response.ok) {
        const recruiter = await response.json();
        setCurrentRecruiter(recruiter);
        setIsAuthenticated(true);
        setStep(3);
        setIsRegistered(true);
        setType(
          recruiter.accountType === "individual" ? "individual" : "company",
        );
        await loadRecruiterJobs(recruiter.id);
      } else if (response.status === 401) {
        try {
          const errorData = await response.json();
          const errorMessage = errorData.error || "Invalid credentials";
          console.error("Login error:", errorMessage);
          if (errorMessage.includes("not verified")) {
            toast.error(
              "Your account is not yet verified. Please contact support.",
            );
          } else {
            toast.error(errorMessage);
          }
        } catch (e) {
          // If response is not JSON, show generic error
          toast.error("Invalid credentials.");
          console.error("Error parsing error response:", e);
        }
      } else {
        console.error(`Login failed with status ${response.status}`);
        toast.error("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please check your connection.");
    }
  };

  // ===== JOB MANAGEMENT FUNCTIONS =====
  // Fetches all job postings for a specific recruiter from the backend
  const loadRecruiterJobs = async (recruiterId: number) => {
    setIsLoadingJobs(true);
    try {
      const response = await apiFetch(
        `/api/jobs/recruiters/${recruiterId}/jobs`,
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      const data = await response.json();
      // Normalize job data and provide fallback company names
      setAllJobs(
        data.map((job: any) => ({
          ...job,
          company:
            job.company ||
            job.recruiter?.companyName ||
            job.recruiter?.contactPerson ||
            "Verified Recruiter",
        })),
      );
    } catch (error) {
      console.error("Failed to load recruiter jobs:", error);
      toast.error("Unable to load your job postings.");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // ===== ACCOUNT REGISTRATION =====
  // Creates a new recruiter account with validation and file uploads
  const handleRegisterAccount = async () => {
    // ===== INPUT VALIDATION =====
    // Ensure all required fields are properly filled
    if (!email.includes("@")) {
      toast.error("Please enter a valid work email.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter to confirm.");
      return;
    }
    if (!contactPerson) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (type === "company" && !companyName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Handle individual recruiters using contact person as company name
    const finalCompanyName =
      type === "individual" && !companyName ? contactPerson : companyName;

    try {
      const formData = new FormData();
      formData.append("companyName", finalCompanyName);
      formData.append("email", email.trim().toLowerCase());
      formData.append("contactPerson", contactPerson);
      formData.append("accountType", type ?? "company");
      formData.append("password", password);
      if (businessRegistration)
        formData.append("businessRegistration", businessRegistration);
      if (orgLogo) formData.append("orgLogo", orgLogo);
      if (authLetter) formData.append("authLetter", authLetter);

      const response = await fetch(
        "http://localhost:8080/api/jobs/recruiters",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const recruiter = await response.json();
        setCurrentRecruiter(recruiter);
        setIsAuthenticated(true);
        setStep(3);
        setIsRegistered(true);
        toast.success(
          "Registration submitted successfully. Awaiting verification.",
        );
      } else {
        toast.error("Registration failed.");
      }
    } catch (error) {
      toast.error("Registration failed.");
    }
  };

  const handleNewPost = async (job: any) => {
    if (!currentRecruiter?.id) {
      toast.error("Recruiter not authenticated.");
      return;
    }

    try {
      const response = await apiFetch("/api/jobs/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...job,
          recruiterId: currentRecruiter.id,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const savedJob = await response.json();
      const normalizedJob = {
        ...savedJob,
        company:
          savedJob.company ||
          savedJob.recruiter?.companyName ||
          savedJob.recruiter?.contactPerson ||
          "Verified Recruiter",
      };
      setAllJobs((prevJobs) => [normalizedJob, ...prevJobs]);
      setIsPosting(false);
      toast.success("Job posted successfully.");
    } catch (error) {
      console.error("Job post failed:", error);
      toast.error("Unable to post job. Please try again.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!currentRecruiter?.id) {
      toast.error("Recruiter not authenticated.");
      return;
    }

    try {
      const response = await apiFetch(
        `/api/jobs/recruiters/${currentRecruiter.id}/jobs/${id}`,
        {
          method: "DELETE",
        },
      );
      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }
      setAllJobs((prevJobs) => prevJobs.filter((j) => j.id !== id));
      window.dispatchEvent(
        new CustomEvent("universe-job-deleted", { detail: { jobId: id } }),
      );
      toast.success("Job removed.");
    } catch (error) {
      console.error("Job delete failed:", error);
      toast.error("Unable to delete job.");
    }
  };

  // ===== UI NAVIGATION & CONDITIONAL RENDERING =====
  // Route to different sub-views based on current application state
  if (showRecovery)
    return <AccessRecovery onBack={() => setShowRecovery(false)} />;
  if (isPosting)
    return (
      <JobPosting
        onBack={() => setIsPosting(false)}
        onPost={handleNewPost}
        recruiterEmail={email}
      />
    );
  if (isSettings)
    return (
      <RecruiterSettings type={type} onBack={() => setIsSettings(false)} />
    );

  // ===== VERIFICATION STATUS & DASHBOARD ACCESS =====
  // Show pending verification screen for unapproved recruiters
  if (isAuthenticated && isRegistered && step === 3) {
    if (currentRecruiter?.status === "PENDING") {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-orange-200/50 shadow-2xl text-center p-10 rounded-[3rem] animate-in fade-in zoom-in-95 duration-500 bg-gradient-to-b from-background to-orange-50/20">
            <div className="size-24 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="size-12 text-orange-500 animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-black mb-4 tracking-tighter">
              Verification Pending
            </CardTitle>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
              The UniVerse Admin team is currently reviewing your legal
              documents. You will be notified once your organization is
              verified.
            </p>
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl font-bold"
              onClick={() => {
                setIsAuthenticated(false);
                setIsRegistering(false);
                setStep(1);
              }}
            >
              Log Out
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <RecruiterDashboard
        type={type}
        accessKey={email}
        jobs={allJobs}
        onPostNew={() => setIsPosting(true)}
        onDeleteJob={(id) =>
          setAllJobs((prevJobs) => prevJobs.filter((job) => job.id !== id))
        }
        onSignOut={() => setIsAuthenticated(false)}
        onOpenSettings={() => setIsSettings(true)}
      />
    );
  }

  // ===== MAIN AUTHENTICATION INTERFACE =====
  // Render login/registration tabs when user is not authenticated
  if (!isAuthenticated && !isRegistering) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="size-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="size-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            UniVerse Recruiter
          </h1>
        </div>
        <Card className="w-full max-w-md border-primary/20 shadow-2xl rounded-[2.5rem]">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-2xl font-black">Portal Access</CardTitle>
            <CardDescription className="font-medium">
              Connect with top undergraduate talent
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1.5 rounded-2xl">
                <TabsTrigger
                  value="login"
                  className="font-bold rounded-xl data-[state=active]:shadow-sm"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="font-bold rounded-xl data-[state=active]:shadow-sm"
                >
                  Register
                </TabsTrigger>
              </TabsList>
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                    Official Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="hr@org.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-muted/20 border-border/60 px-5 rounded-xl font-medium focus-visible:ring-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-muted/20 border-border/60 px-5 rounded-xl focus-visible:ring-1"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <Button
                  className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary shadow-xl shadow-primary/20 mt-4 transition-transform active:scale-[0.98]"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
                <Button
                  variant="link"
                  className="w-full text-xs text-muted-foreground mt-2"
                  onClick={() => setShowRecovery(true)}
                >
                  Forgot Credentials?
                </Button>
              </TabsContent>
              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                    Work Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="recruitment@org.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-muted/20 border-border/60 px-5 rounded-xl font-medium focus-visible:ring-1"
                  />
                </div>
                //Password Creation
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-muted/20 border-border/60 px-5 rounded-xl focus-visible:ring-1"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  // Password strength bar
                  {passwordStrength && (
                    <div className="space-y-1 px-1">
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${
                            passwordStrength.level === "weak"
                              ? "w-1/4"
                              : passwordStrength.level === "fair"
                                ? "w-2/4"
                                : passwordStrength.level === "good"
                                  ? "w-3/4"
                                  : "w-full"
                          }`}
                        />
                      </div>
                      <p
                        className={`text-[10px] font-bold ml-0.5 ${
                          passwordStrength.level === "weak"
                            ? "text-red-500"
                            : passwordStrength.level === "fair"
                              ? "text-orange-400"
                              : passwordStrength.level === "good"
                                ? "text-blue-500"
                                : "text-green-500"
                        }`}
                      >
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                //Confirm Password
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-1 opacity-70">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`h-12 bg-muted/20 px-5 rounded-xl focus-visible:ring-1 transition-colors ${
                        passwordsMatch
                          ? "border-green-400/70 focus-visible:ring-green-400/50"
                          : passwordsMismatch
                            ? "border-red-400/70 focus-visible:ring-red-400/50"
                            : "border-border/60"
                      }`}
                    />
                    <button
                      onClick={() =>
                        setShowRegisterConfirmPassword(
                          !showRegisterConfirmPassword,
                        )
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showRegisterConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  // Password matching
                  {passwordsMatch && (
                    <p className="text-[10px] font-bold text-green-500 ml-1">
                      ✓ Passwords match
                    </p>
                  )}
                  {passwordsMismatch && (
                    <p className="text-[10px] font-bold text-red-500 ml-1">
                      ✗ Passwords do not match
                    </p>
                  )}
                </div>
                <Button
                  className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-primary shadow-xl shadow-primary/20 mt-4 disabled:opacity-50"
                  onClick={() => {
                    setIsRegistering(true);
                    setStep(1);
                  }}
                  disabled={
                    passwordsMismatch ||
                    password.length < 6 ||
                    !email.includes("@")
                  }
                >
                  Continue
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account Type Selection
  if (isRegistering && step === 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-10 animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-black text-primary tracking-tighter">
              Identity Selection
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              Define your presence in the ecosystem.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card
              className={`group cursor-pointer hover:border-primary transition-all border-2 rounded-[2.5rem] p-12 flex flex-col items-center gap-6 ${type === "company" ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5" : "border-muted"}`}
              onClick={() => setType("company")}
            >
              <Building2
                size={72}
                className={
                  type === "company"
                    ? "text-primary"
                    : "text-muted-foreground/40 group-hover:text-primary/50 transition-colors"
                }
              />
              //Corporate
              <div className="text-center">
                <h3 className="text-2xl font-black">Corporate</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                  Verified Organizations
                </p>
              </div>
            </Card>
            <Card
              className={`group cursor-pointer hover:border-primary transition-all border-2 rounded-[2.5rem] p-12 flex flex-col items-center gap-6 ${type === "individual" ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5" : "border-muted"}`}
              onClick={() => setType("individual")}
            >
              <User
                size={72}
                className={
                  type === "individual"
                    ? "text-primary"
                    : "text-muted-foreground/40 group-hover:text-primary/50 transition-colors"
                }
              />
              //Individual
              <div className="text-center">
                <h3 className="text-2xl font-black">Individual</h3>
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">
                  Private Recruiters
                </p>
              </div>
            </Card>
          </div>
          <Button
            className="w-full h-16 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.99]"
            disabled={!type}
            onClick={() => setStep(2)}
          >
            Continue to Verification
          </Button>
        </div>
      </div>
    );
  }

  // Verification Form
  if (isRegistering && step === 2 && !isRegistered) {
    return (
      <div className="min-h-screen bg-background py-20 px-4">
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-700">
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-primary tracking-tighter">
              Verification Portal
            </h2>
            <p className="text-muted-foreground text-lg font-medium italic">
              Complete your {type} profile for approval.
            </p>
          </div>
          <Card className="border-primary/10 shadow-2xl rounded-[3rem] overflow-hidden bg-card/50 backdrop-blur-sm">
            <CardHeader className="bg-muted/30 p-10 border-b border-border/50">
              <CardTitle className="text-2xl font-black flex items-center gap-4">
                <ShieldCheck className="text-primary size-8" /> Entity
                Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                    {type === "company"
                      ? "Company Name"
                      : "Organization Name (Optional)"}
                  </Label>
                  <Input
                    className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    placeholder={
                      type === "company"
                        ? "e.g. Acme Labs SL"
                        : "e.g. Freelancer or Personal Brand"
                    }
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                    {type === "company" ? "Contact Person" : "Your Full Name"}
                  </Label>
                  <Input
                    className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    placeholder={
                      type === "company" ? "John Doe" : "Your Full Name"
                    }
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                    Work Email
                  </Label>
                  <Input
                    type="email"
                    className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    placeholder="hr@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                    Password
                  </Label>
                  <Input
                    type="password"
                    className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                  {type === "company"
                    ? "Organization Overview"
                    : "Personal Overview"}
                </Label>
                <Textarea
                  className="h-40 bg-muted/20 border border-border/60 p-6 rounded-[1.5rem] resize-none font-medium leading-relaxed focus-visible:ring-1 focus-visible:ring-ring/50"
                  placeholder={
                    type === "company"
                      ? "Tell us about your organization and recruitment goals..."
                      : "Tell us about yourself and your recruitment experience..."
                  }
                />
              </div>

              <div className="pt-10 border-t border-border/50">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-6 block">
                  Required Verification Assets
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                      {type === "company"
                        ? "Business Registration"
                        : "Personal ID"}
                    </Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setBusinessRegistration(e.target.files?.[0] || null)
                      }
                      className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                      {type === "company"
                        ? "Organization Logo"
                        : "Profile Picture"}
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setOrgLogo(e.target.files?.[0] || null)}
                      className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-black text-[10px] uppercase tracking-[0.2em] ml-1 opacity-70">
                      {type === "company"
                        ? "Authorization Letter"
                        : "Resume/CV"}
                    </Label>
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setAuthLetter(e.target.files?.[0] || null)
                      }
                      className="h-14 bg-muted/20 border-border/60 px-6 rounded-2xl font-medium focus-visible:ring-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 pt-10">
                <Button
                  variant="ghost"
                  className="flex-1 h-14 rounded-2xl font-bold"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 size-4" /> Go Back
                </Button>
                <Button
                  className="flex-[2] h-14 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-primary/20 bg-primary"
                  onClick={handleRegisterAccount}
                >
                  Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return null;
}
