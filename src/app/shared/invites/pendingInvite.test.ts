import { afterEach, describe, expect, it, vi } from "vitest";

const joinGroupHabitMock = vi.hoisted(() => vi.fn());
vi.mock("../api/habitsApi", () => ({ joinGroupHabit: joinGroupHabitMock }));

import {
  clearPendingGroupInviteCode,
  getPendingGroupInviteCode,
  redeemPendingGroupInvite,
  setPendingGroupInviteCode,
} from "./pendingInvite";

describe("pendingInvite storage", () => {
  afterEach(() => {
    clearPendingGroupInviteCode();
    vi.restoreAllMocks();
  });

  it("stores and retrieves the invite code", () => {
    setPendingGroupInviteCode("ABC123");
    expect(getPendingGroupInviteCode()).toBe("ABC123");
  });

  it("clears the stored code", () => {
    setPendingGroupInviteCode("ABC123");
    clearPendingGroupInviteCode();
    expect(getPendingGroupInviteCode()).toBeNull();
  });

  it("ignores an empty code", () => {
    setPendingGroupInviteCode("");
    expect(getPendingGroupInviteCode()).toBeNull();
  });
});

describe("redeemPendingGroupInvite", () => {
  afterEach(() => {
    clearPendingGroupInviteCode();
    joinGroupHabitMock.mockReset();
  });

  it("does nothing when there is no pending invite", async () => {
    const result = await redeemPendingGroupInvite(1);

    expect(result).toEqual({ group: null, error: null });
    expect(joinGroupHabitMock).not.toHaveBeenCalled();
  });

  it("joins the group and clears the stashed code on success", async () => {
    setPendingGroupInviteCode("ABC123");
    const group = { id: "5", name: "Morning Runners" };
    joinGroupHabitMock.mockResolvedValueOnce(group);

    const result = await redeemPendingGroupInvite(42);

    expect(joinGroupHabitMock).toHaveBeenCalledWith(42, "ABC123");
    expect(result).toEqual({ group, error: null });
    expect(getPendingGroupInviteCode()).toBeNull();
  });

  it("surfaces the error and still clears the stashed code on failure", async () => {
    setPendingGroupInviteCode("EXPIRED");
    joinGroupHabitMock.mockRejectedValueOnce(new Error("Invite code not found"));

    const result = await redeemPendingGroupInvite(42);

    expect(result).toEqual({ group: null, error: "Invite code not found" });
    expect(getPendingGroupInviteCode()).toBeNull();
  });
});
