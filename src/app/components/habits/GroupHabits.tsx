import { useMemo, useState } from "react";
import { useUniStorage } from "../../hooks/useUniStorage";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import {
  Copy,
  Link,
  Mail,
  Plus,
  Trash2,
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
} from "./utils";
import { GroupHabitProgress, HabitGroup } from "./types";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { CalendarModal } from "./CalendarModal";
import { IconPicker, IconBadge } from "./IconPicker";

const currentUser = {
  id: "current-student",
  name: "You",
};

type StatusMessage = {
  type: "success" | "error";
  message: string;
};

export function GroupHabits() {
  const [groups, setGroups] = useUniStorage<HabitGroup[]>("habitGroups", []);
  const [progress, setProgress] = useUniStorage<GroupHabitProgress[]>(
    "habitGroupProgress",
    [],
  );
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

  const recentDays = useMemo(() => getRecentDays(), []);

  const joinedGroups = groups.filter((group) =>
    group.members.some((member) => member.id === currentUser.id),
  );

  const ensureUniqueCode = () => {
    let code = generateInviteCode();
    while (groups.some((group) => group.code === code)) {
      code = generateInviteCode();
    }
    return code;
  };

  const handleCreateGroup = () => {
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
      ownerId: currentUser.id,
      createdAt: new Date().toISOString(),
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
      ],
      iconId: createForm.iconId,
    };

    setGroups([...groups, newGroup]);
    setProgress([...progress, { groupId, completedDates: [], memberProgress: { [currentUser.id]: [] } }]);
    setCreateForm({ name: "", habitName: "", description: "", iconId: "activity" });
    setStatus({ type: "success", message: "Group created. Share the invite link and code." });
  };

  const handleJoinGroup = () => {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!normalizedCode) {
      setStatus({ type: "error", message: "Enter the invite code to join." });
      return;
    }

    const group = groups.find((item) => item.code === normalizedCode);
    if (!group) {
      setStatus({ type: "error", message: "No group found for that code." });
      return;
    }

    if (group.members.some((member) => member.id === currentUser.id)) {
      setStatus({ type: "success", message: "You are already in that group." });
      return;
    }

    const updatedGroups = groups.map((item) =>
      item.id === group.id
        ? {
            ...item,
            members: [
              ...item.members,
              {
                id: currentUser.id,
                name: currentUser.name,
                role: "member" as const,
                joinedAt: new Date().toISOString(),
              },
            ],
          }
        : item,
    );

    const hasProgress = progress.some((item) => item.groupId === group.id);
    const updatedProgress = hasProgress
      ? progress.map((item) =>
          item.groupId === group.id
            ? {
                ...item,
                memberProgress: {
                  ...(item.memberProgress ?? {}),
                  [currentUser.id]: (item.memberProgress ?? {})[currentUser.id] ?? [],
                },
              }
            : item,
        )
      : [...progress, { groupId: group.id, completedDates: [], memberProgress: { [currentUser.id]: [] } }];

    setGroups(updatedGroups);
    setProgress(updatedProgress);
    setJoinCode("");
    setStatus({ type: "success", message: `You joined ${group.name}.` });
  };

  const handleLeaveGroup = (groupId: string) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            members: group.members.filter((member) => member.id !== currentUser.id),
          }
        : group,
    );

    setGroups(updatedGroups);
    setProgress(progress.filter((item) => item.groupId !== groupId));
    setStatus({ type: "success", message: "You left the group." });
  };

  const handleDeleteGroup = (groupId: string) => {
    const groupToDelete = groups.find((g) => g.id === groupId);
    if (!groupToDelete || groupToDelete.ownerId !== currentUser.id) {
      setStatus({ type: "error", message: "Only the group owner can delete the group." });
      return;
    }

    const updatedGroups = groups.filter((g) => g.id !== groupId);
    setGroups(updatedGroups);
    setProgress(progress.filter((item) => item.groupId !== groupId));
    setStatus({ type: "success", message: "Group deleted successfully." });
  };

  const toggleGroupDate = (groupId: string, dateStr: string) => {
    setProgress(
      progress.map((item) => {
        if (item.groupId !== groupId) return item;
        const memberProgress = item.memberProgress ?? {};
        const userDates = memberProgress[currentUser.id] ?? [];
        const isDone = userDates.includes(dateStr);
        const updatedUserDates = isDone
          ? userDates.filter((d) => d !== dateStr)
          : [...userDates, dateStr];

        const updatedMemberProgress = {
          ...memberProgress,
          [currentUser.id]: updatedUserDates,
        };

        const groupDates = Array.from(
          new Set(Object.values(updatedMemberProgress).flat()),
        ).sort();

        return {
          ...item,
          completedDates: groupDates,
          memberProgress: updatedMemberProgress,
        };
      }),
    );
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
            <div className="space-y-2">
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
            const isOwner = group.ownerId === currentUser.id;
            const groupProgress = progress.find((item) => item.groupId === group.id);
            const personalDates = (groupProgress?.memberProgress ?? {})[currentUser.id] ?? groupProgress?.completedDates ?? [];
            const groupDates = Array.from(
              new Set(Object.values(groupProgress?.memberProgress ?? {}).flat()),
            );
            const normalizedGroupDates = groupDates.length > 0 ? groupDates : groupProgress?.completedDates ?? [];
            const streak = calculateStreak(normalizedGroupDates);
            const inviteEmail = buildInviteEmail(
              group.inviteLink,
              group.code,
              group.name,
              group.habitName,
            );

            return (
              <Card key={group.id}>
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
                    {isOwner ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground"
                        onClick={() => handleLeaveGroup(group.id)}
                      >
                        Leave
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-2">
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

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Your Progress</Label>
                        <HeatmapCalendar
                          completedDates={personalDates}
                          color="#3b82f6"
                          months={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Group Progress</Label>
                        <HeatmapCalendar
                          completedDates={normalizedGroupDates}
                          color="#10b981"
                          months={3}
                        />
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
                        completedDates={personalDates}
                        onDateClick={(dateStr) => toggleGroupDate(group.id, dateStr)}
                        habitName={group.habitName}
                        color="#3b82f6"
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
