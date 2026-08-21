import { apiFetch, parseApiError } from "../../shared/api/client";

const configuredBackendUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
function getBackendUrl(): string {
  if (configuredBackendUrl) return configuredBackendUrl.replace(/\/$/, "");
  return "http://localhost:8080";
}

/**
 * API layer for marketplace operations including seller authentication,
 * item management, and seller profile handling
 */

export interface SellerResponse {
  id: number;
  storeName: string;
  email: string;
  phone: string;
  description: string;
  status?: "PENDING" | "VERIFIED" | "REJECTED";
  shopLogoUrl?: string | null;
  notifyNewMessage?: boolean;
  notifyNewOffer?: boolean;
  notifyListingExpiry?: boolean;
  notifyPlatformUpdates?: boolean;
  banned?: boolean;
}

export interface MarketplaceItemResponse {
  id: number;
  itemName: string;
  description: string;
  price: number;
  type: "SELL" | "RENT";
  condition: "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";
  status: "PENDING_APPROVAL" | "ACTIVE" | "REJECTED" | "SOLD" | "RENTED" | "REMOVED" | "SELLER_BANNED";
  imageUrl: string;
  imageUrls: string[];
  category: string | null;
  viewCount: number;
  totalUnits: number;
  soldUnits: number;
  timesRented: number;
  seller: SellerResponse;
}

export interface MarketplaceItemRequest {
  itemName: string;
  description: string;
  price: number;
  type: "SELL" | "RENT";
  condition: "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";
  imageUrl?: string;
  category?: string;
  totalUnits?: number;
  sellerId: number;
}

export interface SellerLoginRequest {
  username: string;
  password: string;
}

export interface SellerAuthResponse {
  token: string;
  seller: SellerResponse;
}

export interface SellerUpdateRequest {
  storeName?: string;
  phone?: string;
  description?: string;
  notifyNewMessage?: boolean;
  notifyNewOffer?: boolean;
  notifyListingExpiry?: boolean;
  notifyPlatformUpdates?: boolean;
}

export interface ChatMessageResponse {
  id: number;
  senderType: "STUDENT" | "SELLER";
  content: string | null;
  imageUrl: string | null;
  sentAt: string;
}

export interface ConversationResponse {
  id: number;
  item: MarketplaceItemResponse | null;
  buyerName: string;
  buyerEmail: string;
  seller: SellerResponse;
  lastMessage: string | null;
  lastMessageAt: string | null;
  hasUnread: boolean;
}

// Sorts conversations so unread ones float to the top, then by most recent activity
// within each group. Used for both the buyer's "My Messages" list and the seller's
// conversation list.
export function sortConversations(conversations: ConversationResponse[]): ConversationResponse[] {
  return [...conversations].sort((a, b) => {
    if (a.hasUnread !== b.hasUnread) return a.hasUnread ? -1 : 1;
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Session management for seller authentication and data persistence
 * Stores seller token and profile data in browser localStorage
 */
const SELLER_TOKEN_KEY = "seller_token";
const SELLER_KEY = "seller_data";

// Retrieves seller's authentication token from localStorage
export function getSellerToken(): string | null {
  return localStorage.getItem(SELLER_TOKEN_KEY);
}

// Stores seller's authentication token in localStorage for future requests
export function setSellerToken(token: string): void {
  localStorage.setItem(SELLER_TOKEN_KEY, token);
}

// Retrieves stored seller profile data from localStorage and parses it
export function getSellerData(): SellerResponse | null {
  const raw = localStorage.getItem(SELLER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SellerResponse;
  } catch {
    return null;
  }
}

// Persists seller profile data to localStorage for offline access and session retention
export function setSellerData(seller: SellerResponse): void {
  localStorage.setItem(SELLER_KEY, JSON.stringify(seller));
}

// Clears all seller session data (logout functionality)
export function clearSellerSession(): void {
  localStorage.removeItem(SELLER_TOKEN_KEY);
  localStorage.removeItem(SELLER_KEY);
  localStorage.removeItem("universe-active-seller");
}

/**
 * Helper function for authenticated seller API requests
 * Automatically includes seller authentication token in request headers
 */
async function sellerFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getSellerToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("X-Seller-Token", token);
  }
  return fetch(`${getBackendUrl()}${path}`, { ...init, credentials: "include", headers });
}

/**
 * Seller authentication operations (register, login)
 */
// Creates a new seller account (with optional verification documents) and returns an auth token
export async function registerSellerAuth(formData: FormData): Promise<SellerAuthResponse> {
  const response = await apiFetch("/api/marketplace/sellers/register", {
    method: "POST",
    body: formData,
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Authenticates seller with username and password credentials
export async function loginSellerAuth(request: SellerLoginRequest): Promise<SellerAuthResponse> {
  const response = await apiFetch("/api/marketplace/sellers/login", {
    method: "POST",
    body: JSON.stringify(request),
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

/**
 * Seller signup email verification (send/verify a 6-digit code before an account exists)
 * and forgot-password (send/verify a 6-digit code, then reset). Both mirror the recruiter
 * flow in job-hub/JobRegistration.tsx and job-hub/AccessRecovery.tsx.
 */
export async function sendSellerEmailCode(email: string): Promise<void> {
  const response = await apiFetch("/api/marketplace/sellers/email/send-code", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function verifySellerEmailCode(email: string, code: string): Promise<string> {
  const response = await apiFetch("/api/marketplace/sellers/email/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  return data.verificationToken as string;
}

export async function sellerForgotPassword(email: string): Promise<void> {
  const response = await apiFetch("/api/marketplace/sellers/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

export async function verifySellerResetCode(email: string, code: string): Promise<string> {
  const response = await apiFetch("/api/marketplace/sellers/verify-reset-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  const data = await response.json();
  return data.resetToken as string;
}

export async function resetSellerPassword(email: string, resetToken: string, newPassword: string): Promise<void> {
  const response = await apiFetch("/api/marketplace/sellers/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, resetToken, newPassword }),
    skipAuthRedirect: true,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

/**
 * Item browsing operations (accessible to students/buyers)
 */
// Fetches all available items in the marketplace with their seller information
export async function getAllItems(): Promise<MarketplaceItemResponse[]> {
  const response = await apiFetch("/api/marketplace/items");
  if (!response.ok) throw new Error("Failed to fetch items");
  return response.json();
}

// Reports a listing for review (inappropriate content, spam, fraud, etc.)
export async function reportItem(itemId: number, reason: string): Promise<void> {
  const response = await apiFetch(`/api/marketplace/items/${itemId}/report`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

// Retrieves detailed information about a specific marketplace item
export async function getItemById(id: number): Promise<MarketplaceItemResponse> {
  const response = await apiFetch(`/api/marketplace/items/${id}`);
  if (!response.ok) throw new Error("Failed to fetch item");
  return response.json();
}

/**
 * Item management operations (seller-only, requires authentication)
 */
// Retrieves all items listed by a specific seller for inventory management
export async function getItemsBySeller(sellerId: number): Promise<MarketplaceItemResponse[]> {
  const response = await apiFetch(`/api/marketplace/items/seller/${sellerId}`);
  if (!response.ok) throw new Error("Failed to fetch seller items");
  return response.json();
}

// Fetches every listing the authenticated seller owns, regardless of status (pending
// moderation, rejected, sold, hidden by a ban, etc.) — for the seller's own dashboard.
// Unlike getItemsBySeller (public, buyer-visible listings only), this requires the
// seller's own token and shows everything so they can manage their full inventory.
export async function getMySellerItems(): Promise<MarketplaceItemResponse[]> {
  const response = await sellerFetch("/api/marketplace/sellers/me/items");
  if (!response.ok) throw new Error("Failed to fetch your listings");
  return response.json();
}

// Lists a new item for sale or rental in the marketplace
export async function createItem(request: MarketplaceItemRequest): Promise<MarketplaceItemResponse> {
  const response = await sellerFetch("/api/marketplace/items", {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Uploads a photo for an existing listing (seller-only)
export async function uploadItemImages(itemId: number, images: File[]): Promise<MarketplaceItemResponse> {
  const formData = new FormData();
  images.forEach((image) => formData.append("images", image));
  const response = await sellerFetch(`/api/marketplace/items/${itemId}/images`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Records that some units of a listing have sold/been rented out (seller-only). Once
// every unit is accounted for, the listing's status flips to SOLD or RENTED.
export async function recordUnitsSold(itemId: number, quantity: number): Promise<MarketplaceItemResponse> {
  const response = await sellerFetch(`/api/marketplace/items/${itemId}/units-sold`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Reopens a RENTED listing for rent again (seller-only, RENT listings only)
export async function reopenForRent(itemId: number): Promise<MarketplaceItemResponse> {
  const response = await sellerFetch(`/api/marketplace/items/${itemId}/reopen-for-rent`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Removes an item from the marketplace (seller-only)
export async function deleteItem(id: number): Promise<void> {
  const response = await sellerFetch(`/api/marketplace/items/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete item");
}

/**
 * Seller profile operations
 */
// Fetches the authenticated seller's profile information
export async function getMySellerProfile(): Promise<SellerResponse> {
  const response = await sellerFetch("/api/marketplace/sellers/me");
  if (!response.ok) throw new Error("No seller profile found");
  return response.json();
}

export async function getSellerById(id: number): Promise<SellerResponse> {
  const response = await apiFetch(`/api/marketplace/sellers/${id}`);
  if (!response.ok) throw new Error("Failed to fetch seller");
  return response.json();
}

// Updates the authenticated seller's profile information
export async function updateMySellerProfile(request: SellerUpdateRequest): Promise<SellerResponse> {
  const response = await sellerFetch("/api/marketplace/sellers/me", {
    method: "PUT",
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Failed to update seller profile");
  return response.json();
}

// Changes the authenticated seller's password, verifying the current one first
export async function changeSellerPassword(currentPassword: string, newPassword: string): Promise<void> {
  const response = await sellerFetch("/api/marketplace/sellers/me/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

// Uploads a new shop logo for the authenticated seller
export async function uploadSellerLogo(image: File): Promise<SellerResponse> {
  const formData = new FormData();
  formData.append("logo", image);
  const response = await sellerFetch("/api/marketplace/sellers/me/logo", {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Submits a request for an admin to re-verify the authenticated seller's account
export async function submitReverificationRequest(reason: string): Promise<void> {
  const response = await sellerFetch("/api/marketplace/sellers/me/reverify", {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
}

/**
 * Buyer-seller chat about a listing. The buyer-side functions use the student session
 * (cookie-based, via apiFetch); the seller-side functions use the seller token (via
 * sellerFetch). The backend tells them apart by which credential is present.
 */

// Starts (or resumes) the current student's conversation with the seller about this item
export async function startConversation(itemId: number): Promise<ConversationResponse> {
  const response = await apiFetch(`/api/marketplace/items/${itemId}/conversations`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Lists the current student's conversations (buyer side)
export async function getMyConversations(): Promise<ConversationResponse[]> {
  const response = await apiFetch("/api/marketplace/conversations");
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Lists conversations across all of the current seller's listings (seller side)
export async function getSellerConversations(): Promise<ConversationResponse[]> {
  const response = await sellerFetch("/api/marketplace/sellers/me/conversations");
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Fetches full message history for a conversation, as the buyer
export async function getMessagesAsBuyer(conversationId: number): Promise<ChatMessageResponse[]> {
  const response = await apiFetch(`/api/marketplace/conversations/${conversationId}/messages`);
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Fetches full message history for a conversation, as the seller
export async function getMessagesAsSeller(conversationId: number): Promise<ChatMessageResponse[]> {
  const response = await sellerFetch(`/api/marketplace/conversations/${conversationId}/messages`);
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Sends a message into a conversation, as the buyer
export async function sendMessageAsBuyer(conversationId: number, content: string): Promise<ChatMessageResponse> {
  const response = await apiFetch(`/api/marketplace/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Sends a message into a conversation, as the seller
export async function sendMessageAsSeller(conversationId: number, content: string): Promise<ChatMessageResponse> {
  const response = await sellerFetch(`/api/marketplace/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Sends a photo into a conversation, as the buyer
export async function sendImageMessageAsBuyer(conversationId: number, image: File): Promise<ChatMessageResponse> {
  const formData = new FormData();
  formData.append("image", image);
  const response = await apiFetch(`/api/marketplace/conversations/${conversationId}/messages/image`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}

// Sends a photo into a conversation, as the seller
export async function sendImageMessageAsSeller(conversationId: number, image: File): Promise<ChatMessageResponse> {
  const formData = new FormData();
  formData.append("image", image);
  const response = await sellerFetch(`/api/marketplace/conversations/${conversationId}/messages/image`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json();
}