import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/ui/button";
import { ScrollArea } from "../../shared/ui/scroll-area";
import { Badge } from "../../shared/ui/badge";
import { X, Send, MessageCircle, Image as ImageIcon, Minus, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  getMessagesAsBuyer,
  getMessagesAsSeller,
  sendMessageAsBuyer,
  sendMessageAsSeller,
  sendImageMessageAsBuyer,
  sendImageMessageAsSeller,
  type ChatMessageResponse,
} from "./marketplaceApi";

/**
 * Chat panel for a single buyer-seller conversation about a listing.
 * Works for either side — pass role="buyer" from the Marketplace browsing view or
 * role="seller" from the Seller Dashboard. Polls for new messages while open.
 *
 * Two display variants:
 * - "floating" (default): a small corner widget. Multiple can be shown at once (e.g.
 *   chatting with several sellers) — pass each one's `offset` (its index among
 *   currently open panels) so they line up side-by-side. Minimizable, closable.
 * - "embedded": fills its parent container instead (e.g. the right pane of a
 *   two-column inbox). No minimize/close chrome — the parent controls visibility.
 */

const POLL_INTERVAL_MS = 4000;
const PANEL_SPACING_PX = 396; // panel width (380px) + gap (16px)

interface ChatPanelProps {
  conversationId: number;
  role: "buyer" | "seller";
  itemName: string;
  otherPartyName: string;
  variant?: "floating" | "embedded";
  offset?: number;
  onClose?: () => void;
}

export function ChatPanel({ conversationId, role, itemName, otherPartyName, variant = "floating", offset = 0, onClose }: ChatPanelProps) {
  const isEmbedded = variant === "embedded";
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(0);
  const [minimized, setMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const minimizedRef = useRef(minimized);
  minimizedRef.current = isEmbedded ? false : minimized;

  const mySenderType = role === "buyer" ? "STUDENT" : "SELLER";
  const fetchMessages = role === "buyer" ? getMessagesAsBuyer : getMessagesAsSeller;
  const sendMessage = role === "buyer" ? sendMessageAsBuyer : sendMessageAsSeller;
  const sendImageMessage = role === "buyer" ? sendImageMessageAsBuyer : sendImageMessageAsSeller;
  const [isSendingImage, setIsSendingImage] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      try {
        const data = await fetchMessages(conversationId);
        if (!cancelled) setMessages(data);
      } catch (error) {
        if (!cancelled) toast.error("Failed to load messages");
      } finally {
        if (!cancelled && showSpinner) setLoading(false);
      }
    };

    load(true);
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const isNearBottom = () => {
    const viewport = scrollContainerRef.current?.querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]');
    if (!viewport) return true;
    return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100;
  };

  // Only auto-scroll when a message was actually added — not on every poll tick — and
  // only if the reader was already near the bottom, so scrolling up to read history
  // isn't interrupted by incoming messages.
  useEffect(() => {
    const isFirstLoad = prevMessageCountRef.current === 0 && messages.length > 0;
    const hasNewMessage = messages.length > prevMessageCountRef.current;
    if (hasNewMessage && !isFirstLoad && minimizedRef.current) {
      setUnreadCount((prev) => prev + (messages.length - prevMessageCountRef.current));
    } else if (hasNewMessage && (isFirstLoad || isNearBottom())) {
      bottomRef.current?.scrollIntoView({ behavior: isFirstLoad ? "auto" : "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const handleToggleMinimize = () => {
    setMinimized((prev) => !prev);
    if (minimized) setUnreadCount(0);
  };

  const handleSend = async () => {
    const content = draft.trim();
    if (!content) return;
    setIsSending(true);
    try {
      const sent = await sendMessage(conversationId, content);
      setMessages((prev) => [...prev, sent]);
      setDraft("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendImage = async (file: File) => {
    setIsSendingImage(true);
    try {
      const sent = await sendImageMessage(conversationId, file);
      setMessages((prev) => [...prev, sent]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send image");
    } finally {
      setIsSendingImage(false);
    }
  };

  const showBody = isEmbedded || !minimized;

  return (
    <div
      style={isEmbedded ? undefined : { right: `calc(1rem + ${offset * PANEL_SPACING_PX}px)` }}
      className={
        isEmbedded
          ? "w-full h-full bg-background flex flex-col overflow-hidden"
          : `fixed bottom-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 ${
              minimized ? "h-auto" : "h-[560px] max-h-[calc(100vh-2rem)]"
            }`
      }
    >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b select-none ${isEmbedded ? "" : "cursor-pointer"}`}
          onClick={isEmbedded ? undefined : handleToggleMinimize}
        >
          <div className="flex items-center gap-2 min-w-0">
            <MessageCircle className="size-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{otherPartyName}</p>
              {showBody && <p className="text-xs text-muted-foreground truncate">{itemName}</p>}
            </div>
            {!isEmbedded && minimized && unreadCount > 0 && (
              <Badge className="ml-1 h-5 min-w-5 px-1.5 flex-shrink-0 rounded-full justify-center">{unreadCount}</Badge>
            )}
          </div>
          {!isEmbedded && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleMinimize(); }}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label={minimized ? "Expand chat" : "Minimize chat"}
              >
                {minimized ? <ChevronUp className="size-5 text-muted-foreground" /> : <Minus className="size-5 text-muted-foreground" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                className="p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Close chat"
              >
                <X className="size-5 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>

        {showBody && (
          <>
        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0">
        <ScrollArea className="h-full p-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-8">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Say hello!
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isMine = message.senderType === mySenderType;
                return (
                  <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl text-sm ${message.imageUrl ? "p-1.5" : "px-4 py-2"} ${
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Shared photo"
                          className="rounded-xl max-w-full max-h-64 object-cover cursor-pointer"
                          onClick={() => window.open(message.imageUrl!, "_blank")}
                        />
                      )}
                      {message.content && (
                        <p className={`whitespace-pre-wrap break-words ${message.imageUrl ? "px-2 pt-2" : ""}`}>{message.content}</p>
                      )}
                      <p className={`text-[10px] mt-1 ${message.imageUrl ? "px-2 pb-1" : ""} ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(message.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
        </div>

        {/* Composer */}
        <div className="p-3 border-t flex gap-2">
          <label className="flex-shrink-0">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              disabled={isSendingImage}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSendImage(file);
                e.target.value = "";
              }}
            />
            <span
              className={`inline-flex items-center justify-center size-9 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors cursor-pointer ${
                isSendingImage ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <ImageIcon className="size-4" />
            </span>
          </label>
          <input
            className="flex-1 rounded-full border border-border bg-input-background px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Type a message..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            maxLength={2000}
          />
          <Button size="icon" className="rounded-full flex-shrink-0" onClick={handleSend} disabled={isSending || !draft.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
          </>
        )}
    </div>
  );
}
