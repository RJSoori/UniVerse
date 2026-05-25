import { apiFetch } from "../../shared/api/client";

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
}

export interface MarketplaceItemResponse {
  id: number;
  itemName: string;
  description: string;
  price: number;
  type: "SELL" | "RENT";
  condition: "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";
  status: "ACTIVE" | "SOLD" | "RENTED" | "REMOVED";
  imageUrl: string;
  seller: SellerResponse;
}

export interface MarketplaceItemRequest {
  itemName: string;
  description: string;
  price: number;
  type: "SELL" | "RENT";
  condition: "BRAND_NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "FOR_PARTS";
  imageUrl?: string;
  sellerId: number;
}

export interface SellerRequest {
  storeName: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  description?: string;
}

export interface SellerLoginRequest {
  username: string;
  password: string;
}

export interface SellerAuthResponse {
  token: string;
  seller: SellerResponse;
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
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("X-Seller-Token", token);
  }
  return fetch(`http://localhost:8080${path}`, { ...init, headers });
}

/**
 * Seller authentication operations (register, login)
 */
// Creates a new seller account and returns authentication token
export async function registerSellerAuth(request: SellerRequest): Promise<SellerAuthResponse> {
  const response = await apiFetch("/api/marketplace/sellers/register", {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Failed to register seller");
  return response.json();
}

// Authenticates seller with username and password credentials
export async function loginSellerAuth(request: SellerLoginRequest): Promise<SellerAuthResponse> {
  const response = await apiFetch("/api/marketplace/sellers/login", {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Invalid username or password");
  return response.json();
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
  const response = await sellerFetch(`/api/marketplace/items/seller/${sellerId}`);
  if (!response.ok) throw new Error("Failed to fetch seller items");
  return response.json();
}

// Lists a new item for sale or rental in the marketplace
export async function createItem(request: MarketplaceItemRequest): Promise<MarketplaceItemResponse> {
  const response = await sellerFetch("/api/marketplace/items", {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Failed to create item");
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