import { Wallet } from "../types";

export const CATEGORY_EMOJI_MAP: Record<string, string> = {
  Food: "🍽️",
  "Dining Out": "🍕",
  Transportation: "🚗",
  "Rent / Accommodation": "🏠",
  Education: "📚",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Health: "⚕️",
  Clothing: "👕",
  Bills: "💵",
  Allowance: "💰",
  Salary: "💼",
  Freelance: "💻",
  Scholarship: "🎓",
  Business: "📊",
  Dividends: "📈",
  Investments: "🏦",
  Tips: "🎁",
  Other: "📌",
};

export const getCategoryEmoji = (category: string): string => {
  return CATEGORY_EMOJI_MAP[category] || "💳";
};

export const getWalletName = (walletId: string, wallets: Wallet[]): string => {
  return wallets.find((w: Wallet) => w.id === walletId)?.name || "Unknown Wallet";
};
