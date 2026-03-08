import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle, BarChart3, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { usePolls } from "@/hooks/use-polls";
import { useAnnouncements } from "@/hooks/use-announcements";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PollCreate, PollCard } from "@/components/PollComponents";
import { AnnouncementCreate, AnnouncementCard } from "@/components/AnnouncementComponents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Chat = () => {
  const [text, setText] = useState("");
  const [showPollForm, setShowPollForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const { user, isAdmin } = useAuth();
  const { data: students = [] } = useStudents();
  const { data: polls = [] } = usePolls();
  const { data: announcements = [] } = useAnnouncements();

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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowPollForm(!showPollForm); setShowAnnouncementForm(false); }}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowAnnouncementForm(!showAnnouncementForm); setShowPollForm(false); }}
                className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Megaphone className="h-4 w-4" />
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {/* Announcements Banner */}
          {announcements.length > 0 && (
            <div className="px-4 pt-4 space-y-2">
              {announcements.filter((a) => a.is_pinned).map((a) => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))}
            </div>
          )}

          {/* Create Forms */}
          <div className="px-4 pt-3">
            {showPollForm && <PollCreate onClose={() => setShowPollForm(false)} />}
            {showAnnouncementForm && <AnnouncementCreate onClose={() => setShowAnnouncementForm(false)} />}
          </div>

          {/* Tabs: Messages | Polls | Announcements */}
          <Tabs defaultValue="messages" className="px-4 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="messages" className="flex-1">
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Chat
              </TabsTrigger>
              <TabsTrigger value="polls" className="flex-1">
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Polls ({polls.length})
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex-1">
                <Megaphone className="h-3.5 w-3.5 mr-1.5" /> News ({announcements.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="py-4 space-y-3">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-10">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No messages yet. Say hi! 👋</p>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.user_id === user?.id;
                  const sender = students.find((s) => s.user_id === msg.user_id);
                  const senderName = sender?.name || msg.user_name || msg.user_email;
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
                        {!isMe && <p className="text-xs font-semibold text-accent mb-1">{senderName}</p>}
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
            </TabsContent>

            <TabsContent value="polls" className="py-4 space-y-4">
              {polls.length === 0 ? (
                <div className="text-center py-10">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No polls yet. Create one!</p>
                </div>
              ) : (
                polls.map((poll) => <PollCard key={poll.id} poll={poll} />)
              )}
            </TabsContent>

            <TabsContent value="announcements" className="py-4 space-y-3">
              {announcements.length === 0 ? (
                <div className="text-center py-10">
                  <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No announcements yet.</p>
                </div>
              ) : (
                announcements.map((a) => <AnnouncementCard key={a.id} announcement={a} />)
              )}
            </TabsContent>
          </Tabs>
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
