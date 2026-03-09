import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useParams } from "react-router-dom";
import { useDirectMessages, useSendDirectMessage, useConversations } from "@/hooks/use-conversations";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { format } from "date-fns";

const DirectMessage = () => {
  const { id } = useParams<{ id: string }>();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useDirectMessages(id || null);
  const { data: conversations = [] } = useConversations();
  const sendMessage = useSendDirectMessage();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();

  const conversation = conversations.find((c) => c.id === id);

  const getConversationName = () => {
    if (!conversation) return "Chat";
    if (conversation.type === "group") return conversation.name || "Group Chat";
    const otherMember = conversation.members.find((m) => m.user_id !== user?.id);
    const otherStudent = students.find((s) => s.user_id === otherMember?.user_id);
    return otherStudent?.name || "Chat";
  };

  const memberCount = conversation?.members.length || 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !user || !id) return;
    sendMessage.mutate({ conversationId: id, senderId: user.id, content: text.trim() });
    setText("");
  };

  const getSender = (senderId: string) => {
    return students.find((s) => s.user_id === senderId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-primary px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <Link to="/messages">
            <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-lg text-primary-foreground">{getConversationName()}</h1>
            {conversation?.type === "group" && (
              <p className="text-xs text-primary-foreground/60 flex items-center gap-1">
                <Users className="h-3 w-3" /> {memberCount} members
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-10">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No messages yet. Say hi! 👋</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              const sender = getSender(msg.sender_id);
              const senderName = sender?.name || "Unknown";
              const senderAvatar = sender?.profile_picture_url;
              const senderEmoji = sender?.avatar || "👤";

              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border">
                      {senderAvatar ? (
                        <img src={senderAvatar} alt={senderName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{senderEmoji}</span>
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-card text-card-foreground border border-border rounded-bl-md"
                    }`}
                  >
                    {!isMe && conversation?.type === "group" && (
                      <p className="text-xs font-semibold text-accent mb-1">{senderName}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                  {isMe && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border">
                      {senderAvatar ? (
                        <img src={senderAvatar} alt="You" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{senderEmoji}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <div className="mx-auto max-w-3xl flex gap-2">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!text.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DirectMessage;
