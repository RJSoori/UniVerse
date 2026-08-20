import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../shared/ui/dialog";
import { Badge } from "../../shared/ui/badge";
import { Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, parseApiError } from "../../shared/api/client";

interface SuggestedSkillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SuggestedSkill {
  skill: string;
  jobsUnlocked: number;
}

/**
 * Top 5 skills the student doesn't have yet that would push the most currently-sub-80%-match
 * job postings up to a "suitable" (>=80%) UniVerse Skill Matcher score. Backed by
 * GET /api/skills/suggested-skills - see SkillMatchService on the backend.
 */
export function SuggestedSkillsDialog({ open, onOpenChange }: SuggestedSkillsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Suggested Skills
          </DialogTitle>
          <DialogDescription>
            Skills you don't have yet that would unlock the most job postings at an 80%+
            match score.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Analyzing job postings...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center gap-2">
            <Target className="size-8 text-muted-foreground opacity-30" />
            <p className="text-sm font-semibold">No standout suggestions right now.</p>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              Either your skill set already covers most listed roles well, or picking up a
              single skill wouldn't be enough to cross 80% on any of them yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, index) => (
              <div
                key={s.skill}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border/60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-primary/60 w-4">
                    {index + 1}
                  </span>
                  <span className="font-bold text-sm">{s.skill}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold px-3 py-1">
                  Unlocks {s.jobsUnlocked} job{s.jobsUnlocked === 1 ? "" : "s"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
