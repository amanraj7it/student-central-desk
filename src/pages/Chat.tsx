import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const Chat = () => {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const { user } = useAuth();
  const { data: students = [] } = useStudents();

  const myStudent = students.find((s) => s.user_id === user?.id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !user) return;
    sendMessage.mutate({
      content: text.trim(),
      userId: user.id,
      userEmail: user.email || "",
      userName: myStudent?.name,
    });
    setText("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-primary px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <MessageCircle className="h-5 w-5 text-accent" />
            <h1 className="font-display text-xl text-primary-foreground">Class Chat</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-10">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No messages yet. Say hi! 👋</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-accent text-accent-foreground rounded-br-md"
                        : "bg-card text-card-foreground border border-border rounded-bl-md"
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-medium text-accent mb-1">
                        {msg.user_name || msg.user_email}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-accent-foreground/60" : "text-muted-foreground"}`}>
                      {format(new Date(msg.created_at), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
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

export default Chat;
