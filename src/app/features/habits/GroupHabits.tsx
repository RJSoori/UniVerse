import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useGroupHabits } from "../../shared/hooks/useGroupHabits";
import { Button } from "../../shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../shared/ui/card";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Textarea } from "../../shared/ui/textarea";
import { Badge } from "../../shared/ui/badge";
import {
  Copy,
  Link,
  Mail,
  Plus,
  Users,
  UserPlus,
  Calendar,
} from "lucide-react";
import {
  buildInviteEmail,
  buildInviteLink,
  calculateStreak,
  generateInviteCode,
  getRecentDays,
  toDateKey,
  detectPatternAlert,
} from "./utils";
import { HabitGroup } from "./types";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { CalendarModal } from "./CalendarModal";
import { IconPicker, IconBadge } from "./IconPicker";

type StatusMessage = {
  type: "success" | "error";
  message: string;
};
/**
 * Lets students create, join, and track group habits together.
 * Generates invite codes and tracks which group members completed the habit each day.
 */
export function GroupHabits() {
  const { user } = useAuth();
      const { groups, addGroup, updateGroup, removeGroup, joinGroup, loading, error } = useGroupHabits();
  const currentUserId = user?.id?.toString() ?? "";
  const currentUserName = user?.name ?? "You";
      const [createForm, setCreateForm] = useState({
    name: "",
    habitName: "",
    description: "",
    iconId: "activity",
  });
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null);
  const [highlightedGroupId, setHighlightedGroupId] = useState<string | null>(null);
  const groupCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const recentDays = useMemo(() => getRecentDays(), []);

  useEffect(() => {
    if (!highlightedGroupId) {
      return;
    }

    const element = groupCardRefs.current[highlightedGroupId];
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

    const timeout = window.setTimeout(() => {
      setHighlightedGroupId(null);
    }, 1800);

    return () => window.clearTimeout(timeout);
  }, [highlightedGroupId, groups]);

  // Build the list of groups the current user should see as "joined".
  // NOTE: member.id values may come from the backend as numbers or strings;
  // normalize to string for robust comparisons (prevents joined groups disappearing).
  const joinedGroups = groups.filter((group) =>
    group.members.some((member) => String(member.id) === currentUserId),
  );

  const getGroupProgressDates = (group: HabitGroup) => {
    const memberProgressDates = group.memberProgress
      ? Object.values(group.memberProgress).flat()
      : [];

    return Array.from(new Set((memberProgressDates.length > 0 ? memberProgressDates : group.completedDates ?? [])));
  };

  const getCurrentUserProgressDates = (group: HabitGroup) => {
    if (group.memberProgress?.[currentUserId]) {
      return group.memberProgress[currentUserId];
    }

    return group.completedDates ?? [];
  };

  const getOtherMembersProgressDates = (group: HabitGroup) => {
    const collected = new Set<string>();

    Object.entries(group.memberProgress ?? {}).forEach(([memberId, dates]) => {
      if (memberId === currentUserId) {
        return;
      }

      (dates ?? []).forEach((date) => {
        if (date) {
          collected.add(date);
        }
      });
    });

    return Array.from(collected);
  };

  const getMemberProgressDates = (group: HabitGroup, memberId: string) => {
    return group.memberProgress?.[memberId] ?? [];
  };

  const buildMemberProgress = (group: HabitGroup, updatedUserDates: string[]) => {
    const progress = { ...(group.memberProgress || {}) };
    progress[currentUserId] = Array.from(new Set(updatedUserDates));
    return progress;
  };

  /**
   * Generates a new invite code that no other group is using.
   * Keeps generating until it finds a unique one.
   */
  const ensureUniqueCode = () => {
    let code = generateInviteCode();
    const existing = new Set(groups.map((g) => (g.code ?? "").toUpperCase()));
    while (existing.has(code.toUpperCase())) {
      code = generateInviteCode();
    }
    return code;
  };

  /**
   * Creates a new group habit and generates an invite code.
   * Saves the group to the database and shows an invite link.
   */
  const handleCreateGroup = async () => {
    if (!currentUserId) {
      setStatus({ type: "error", message: "Please sign in before creating a group." });
      return;
    }

    if (!createForm.name.trim() || !createForm.habitName.trim()) {
      setStatus({ type: "error", message: "Group name and habit are required." });
      return;
    }

    const groupId = Date.now().toString();
    const code = ensureUniqueCode();
    const inviteLink = buildInviteLink(groupId, code);

    const newGroup: HabitGroup = {
      id: groupId,
      name: createForm.name.trim(),
      habitName: createForm.habitName.trim(),
      description: createForm.description.trim(),
      code,
      inviteLink,
      ownerId: currentUserId,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: currentUserId,
          name: currentUserName,
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
      ],
      iconId: createForm.iconId,
      completedDates: [],
      memberProgress: {
        [currentUserId]: [],
      },
    };

    try {
      const created = await addGroup(newGroup);
      setCreateForm({ name: "", habitName: "", description: "", iconId: "activity" });
      setStatus({ type: "success", message: "Group created. Share the invite link and code." });

      const createdId = created?.id?.toString() ?? groupId;

      // Find the nearest scrollable ancestor to handle nested scroll containers.
      const findScrollableAncestor = (el: HTMLElement | null) => {
        let ancestor = el?.parentElement ?? null;
        while (ancestor && ancestor !== document.body) {
          const style = window.getComputedStyle(ancestor);
          const overflowY = style.overflowY;
          if ((overflowY === "auto" || overflowY === "scroll") && ancestor.scrollHeight > ancestor.clientHeight) {
            return ancestor;
          }
          ancestor = ancestor.parentElement;
        }
        return document.scrollingElement || document.documentElement;
      };

      // Scroll helper: position the card in the scrollable ancestor so it's fully visible.
      const scrollToCard = (idStr: string) => {
        try {
          const el = document.querySelector(`[data-group-id="${idStr}"]`) as HTMLElement | null;
          if (!el) return false;

          const ancestor = findScrollableAncestor(el) as HTMLElement;
          const elRect = el.getBoundingClientRect();
          const ancRect = ancestor.getBoundingClientRect();
          const headerOffset = 96; // leave space for app header / padding

          // Calculate the position relative to the scrollable ancestor so the whole card is visible
          const desiredTop = ancestor.scrollTop + (elRect.top - ancRect.top) - headerOffset;
          const maxTop = ancestor.scrollHeight - ancestor.clientHeight;
          const finalTop = Math.max(0, Math.min(desiredTop, maxTop));

          ancestor.scrollTo({ top: finalTop, behavior: "smooth" });
          setHighlightedGroupId(idStr);
          window.setTimeout(() => setHighlightedGroupId(null), 1800);
          return true;
        } catch (e) {
          return false;
        }
      };

      // Try immediate scroll; if the node isn't in the DOM yet, observe mutations and scroll as soon as it appears.
      if (!scrollToCard(createdId)) {
        const obs = new MutationObserver((mutations, observer) => {
          if (scrollToCard(createdId)) observer.disconnect();
        });
        obs.observe(document.body, { childList: true, subtree: true });

        // Fallback retry after a short delay
        window.setTimeout(() => scrollToCard(createdId), 250);
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to create group" });
    }
  };

  /**
   * Joins an existing group using an invite code.
   * Adds the current user to the group's member list.
   */
  const handleJoinGroup = async () => {
    if (!currentUserId) {
      setStatus({ type: "error", message: "Please sign in before joining a group." });
      return;
    }

    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      setStatus({ type: "error", message: "Enter the invite code to join." });
      return;
    }

    try {
      const joined = await joinGroup(normalizedCode);
      setJoinCode("");
      setStatus({ type: "success", message: `You joined ${joined?.name ?? "the group"}.` });
      // Scroll to the newly-joined group if present in the DOM after state updates
      const createdId = joined?.id?.toString();
      if (createdId) {
        const findScrollableAncestor = (el: HTMLElement | null) => {
          let ancestor = el?.parentElement ?? null;
          while (ancestor && ancestor !== document.body) {
            const style = window.getComputedStyle(ancestor);
            const overflowY = style.overflowY;
            if ((overflowY === "auto" || overflowY === "scroll") && ancestor.scrollHeight > ancestor.clientHeight) {
              return ancestor;
            }
            ancestor = ancestor.parentElement;
          }
          return document.scrollingElement || document.documentElement;
        };

        const scrollToCard = (idStr: string) => {
          try {
            const el = document.querySelector(`[data-group-id="${idStr}"]`) as HTMLElement | null;
            if (!el) return false;

            const ancestor = findScrollableAncestor(el) as HTMLElement;
            const elRect = el.getBoundingClientRect();
            const ancRect = ancestor.getBoundingClientRect();
            const headerOffset = 96;

            const desiredTop = ancestor.scrollTop + (elRect.top - ancRect.top) - headerOffset;
            const maxTop = ancestor.scrollHeight - ancestor.clientHeight;
            const finalTop = Math.max(0, Math.min(desiredTop, maxTop));

            ancestor.scrollTo({ top: finalTop, behavior: "smooth" });
            setHighlightedGroupId(idStr);
            window.setTimeout(() => setHighlightedGroupId(null), 1800);
            return true;
          } catch (e) {
            return false;
          }
        };

        if (!scrollToCard(createdId)) {
          const obs = new MutationObserver((mutations, observer) => {
            if (scrollToCard(createdId)) observer.disconnect();
          });
          obs.observe(document.body, { childList: true, subtree: true });

          window.setTimeout(() => scrollToCard(createdId), 250);
        }
      }
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : "Failed to join group" });
    }
  };
  // Leave one group habit for the current user.
  // If the owner leaves and there are other members, promote the first member to owner.
  // If the last member leaves, the group will be deleted.
  const handleLeaveGroup = async (groupId: string) => {
    if (!currentUserId) {
      setStatus({ type: "error", message: "Please sign in first." });
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) {
      setStatus({ type: "error", message: "Group not found." });
      return;
    }

    // Remove current user from members
    const remaining = (group.members || []).filter((m) => String(m.id) !== currentUserId);

    // If no members remain, delete the group
    if (remaining.length === 0) {
      try {
        await removeGroup(groupId);
        setStatus({ type: "success", message: "Left and removed empty group." });
      } catch (error) {
        setStatus({ type: "error", message: "Failed to remove group." });
      }
      return;
    }

    // If the owner is leaving, promote the first remaining member to owner
    const newOwnerId = group.ownerId === currentUserId ? remaining[0].id : group.ownerId;

    const updatedGroup: HabitGroup = {
      ...group,
      ownerId: newOwnerId,
      members: remaining,
    };

    try {
      await updateGroup(updatedGroup);
      setStatus({ type: "success", message: "Left group successfully." });
    } catch (error) {
      setStatus({ type: "error", message: "Failed to leave group" });
    }
  };



  // Toggle one completion date for the selected group habit.
  const toggleGroupDate = async (groupId: string, dateStr: string) => {
    if (!currentUserId) {
      setStatus({ type: "error", message: "Please sign in first." });
      return;
    }

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const currentUserDates = getCurrentUserProgressDates(group);
    const isDone = currentUserDates.includes(dateStr);
    const updatedCurrentUserDates = isDone
      ? currentUserDates.filter((d) => d !== dateStr)
      : [...currentUserDates, dateStr];

    const updatedMemberProgress = buildMemberProgress(group, updatedCurrentUserDates);
    const updatedCompletedDates = Array.from(new Set(Object.values(updatedMemberProgress).flat()));

    try {
      await updateGroup({
        ...group,
        completedDates: updatedCompletedDates,
        memberProgress: updatedMemberProgress,
      });
    } catch (error) {
      setStatus({ type: "error", message: "Failed to update habit completion" });
    }
  };
  const copyToClipboard = async (value: string, key: string) => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Group Habits</h3>
        <p className="text-muted-foreground text-sm">
          Create shared habits, invite friends, and track progress together.
        </p>
      </div>

      {status && (
        <Card className="border-muted">
          <CardContent className="py-4 text-sm flex items-center gap-2">
            <span className={status.type === "success" ? "text-primary" : "text-destructive"}>
              {status.message}
            </span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Create Group Habit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                placeholder="e.g., Healthy Dormmates"
                value={createForm.name}
                onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })}
              />
            </div>
            <div className="space-y-2 border-b pb-4 dark:border-gray-700">
              <Label>Group Habit</Label>
              <Input
                placeholder="e.g., 4L Water Daily"
                value={createForm.habitName}
                onChange={(event) => setCreateForm({ ...createForm, habitName: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Add context for the group"
                value={createForm.description}
                onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Choose Icon</Label>
              <IconPicker selectedIconId={createForm.iconId} onSelect={(iconId) => setCreateForm({ ...createForm, iconId })} />
            </div>
            <Button className="w-full" onClick={handleCreateGroup}>
              Create Group & Generate Invite
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              Join a Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Invite Code</Label>
              <Input
                placeholder="Enter the 6-character code"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value)}
              />
            </div>
            <Button className="w-full" variant="secondary" onClick={handleJoinGroup}>
              Join Group
            </Button>
            <p className="text-xs text-muted-foreground">
              Ask the group owner for the invite link and code sent via email.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Your Groups</h4>
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" />
            {joinedGroups.length} active
          </Badge>
        </div>

        {joinedGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No group habits yet. Create or join a group to start tracking together.
            </CardContent>
          </Card>
        ) : (
          joinedGroups.map((group) => {
            const ref = (element: HTMLDivElement | null) => {
              groupCardRefs.current[group.id] = element;
            };
            const isOwner = group.ownerId === currentUserId;
            const normalizedGroupDates = getGroupProgressDates(group);
            const myProgressDates = getCurrentUserProgressDates(group);
            const otherMembersProgressDates = getOtherMembersProgressDates(group);
            const streak = calculateStreak(normalizedGroupDates);
            const inviteEmail = buildInviteEmail(
              group.inviteLink,
              group.code,
              group.name,
              group.habitName,
            );

            return (
              <Card key={group.id} ref={ref} data-group-id={group.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <IconBadge iconId={group.iconId} size="lg" color="#3b82f6" />
                      <div className="space-y-2">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{group.habitName}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{group.members.length} members</Badge>
                          {isOwner && <Badge>Owner</Badge>}
                          <Badge variant="outline">{streak} day streak</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleLeaveGroup(group.id)}
                    >
                      Leave
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`grid gap-4 ${isOwner ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
                    {isOwner && (
                      <div className="space-y-4">
                        {group.description && (
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        )}
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Link className="h-3 w-3" /> Invite Link
                            </Label>
                            <div className="flex gap-2">
                              <Input value={group.inviteLink} readOnly className="text-xs" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(group.inviteLink, `${group.id}-link`)}
                              >
                                <Copy className="h-4 w-4" />
                                {copiedKey === `${group.id}-link` ? "Copied" : "Copy"}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Users className="h-3 w-3" /> Invite Code
                            </Label>
                            <div className="flex gap-2">
                              <Input value={group.code} readOnly className="text-xs" />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(group.code, `${group.id}-code`)}
                              >
                                <Copy className="h-4 w-4" />
                                {copiedKey === `${group.id}-code` ? "Copied" : "Copy"}
                              </Button>
                            </div>
                          </div>
                          <Button variant="secondary" size="sm" asChild>
                            <a href={inviteEmail}>
                              <Mail className="h-4 w-4" /> Email Invite
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div className="space-y-3">
                        <Label>Member Progress</Label>
                        <div className={`grid gap-3 ${isOwner ? "" : "sm:grid-cols-2 xl:grid-cols-2"}`}>
                          {group.members.map((member) => (
                            <div key={member.id} className="space-y-2 rounded-2xl border bg-muted/20 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-medium">{member.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {member.role === "owner" ? "Owner" : "Member"}
                                  </p>
                                </div>
                                {String(member.id) === currentUserId && (
                                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                                    You
                                  </Badge>
                                )}
                              </div>
                              <HeatmapCalendar
                                completedDates={getMemberProgressDates(group, String(member.id))}
                                color={String(member.id) === currentUserId ? "#3b82f6" : "#22c55e"}
                                months={3}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={() => setOpenCalendarId(group.id)}
                        className="w-full"
                        variant="secondary"
                      >
                        <Calendar className="h-4 w-4 mr-2" /> Mark Progress
                      </Button>
                      <CalendarModal
                        open={openCalendarId === group.id}
                        onOpenChange={(open) => setOpenCalendarId(open ? group.id : null)}
                        completedDates={myProgressDates}
                        onDateClick={(dateStr) => toggleGroupDate(group.id, dateStr)}
                        habitName={group.habitName}
                        color="#3b82f6"
                        patternAlertText={detectPatternAlert(normalizedGroupDates, group.createdAt) || undefined}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}



