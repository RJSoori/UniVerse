import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../shared/ui/dialog";
import { Badge } from "../../shared/ui/badge";
import { Sparkles, Target, Briefcase, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, parseApiError } from "../../shared/api/client";

interface SkillMatcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The same job list already loaded on the Job Hub page - reused here so clicking a match
   * takes the student straight to that exact posting instead of leaving them with no way in. */
  jobs: any[];
  matchScores: Record<number, number>;
  onSelectJob: (job: any) => void;
}

interface SuggestedSkill {
  /** One skill for an ordinary suggestion, or two when neither works alone - see
   * SkillMatchService#computeSuggestedSkills on the backend. */
  skills: string[];
  jobsUnlocked: number;
}

const MATCH_THRESHOLD = 80;

/**
 * The full "UniVerse Skill Matcher" view, in two sections:
 *   1. Every open role the student is currently an 80%+ match for - clickable, so they can
 *      actually open that exact posting (the Job Hub summary card used to only name the single
 *      best match with no way to reach it).
 *   2. Skills that would unlock more roles - GET /api/skills/suggested-skills. Most entries are
 *      a single skill; some are a *pair* the backend only suggests when no single skill alone
 *      would cross the 80% threshold for that posting - both need to be picked up together.
 */
export function SkillMatcherDialog({
  open,
  onOpenChange,
  jobs,
  matchScores,
  onSelectJob,
}: SkillMatcherDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([]);

  useEffect(() => {
    if (!open) return;

    const loadSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await apiFetch("/api/skills/suggested-skills");
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        setSuggestions(await response.json());
      } catch (error) {
        console.error("Failed to load suggested skills:", error);
        toast.error("Unable to load suggested skills. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [open]);

  const matchingJobs = jobs
    .filter((job) => (matchScores[job.id] ?? 0) >= MATCH_THRESHOLD)
    .sort((a, b) => (matchScores[b.id] ?? 0) - (matchScores[a.id] ?? 0));

  const handleSelectJob = (job: any) => {
    onSelectJob(job);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> UniVerse Skill Matcher
          </DialogTitle>
          <DialogDescription>
            How your current skills stack up against open roles, and what would improve that.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Section 1: roles at 80%+ match, clickable straight through to the posting */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Briefcase className="size-3.5" /> Roles You're an 80%+ Match For
            </h4>
            {matchingJobs.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                No open roles match your skills at 80% or higher yet.
              </div>
            ) : (
              <div className="space-y-2">
                {matchingJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectJob(job)}
                    className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                  >
                    <span className="font-bold text-sm">{job.title}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black">
                        {matchScores[job.id]}%
                      </Badge>
                      <ArrowRight className="size-3.5 text-muted-foreground" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: skills (or skill pairs) that would unlock more roles */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Sparkles className="size-3.5" /> Skills That Would Unlock More Roles
            </h4>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Analyzing job postings...
              </div>
            ) : suggestions.length === 0 ? (
              <div className="py-6 text-center flex flex-col items-center gap-2 bg-muted/20 rounded-xl border border-dashed px-4">
                <Target className="size-7 text-muted-foreground opacity-30" />
                <p className="text-sm font-semibold">No standout suggestions right now.</p>
                <p className="text-xs text-muted-foreground max-w-[320px] pb-2">
                  Either your skill set already covers most listed roles well, or picking up
                  new skills wouldn't be enough to cross 80% on any of them yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {suggestions.map((s, index) => (
                  <div
                    key={s.skills.join("+")}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-primary/60 w-4">
                        {index + 1}
                      </span>
                      <span className="font-bold text-sm">{s.skills.join(" + ")}</span>
                      {s.skills.length > 1 && (
                        <Badge variant="outline" className="text-[9px] font-bold uppercase">
                          Learn together
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-bold px-3 py-1 shrink-0">
                      Unlocks {s.jobsUnlocked} job{s.jobsUnlocked === 1 ? "" : "s"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
