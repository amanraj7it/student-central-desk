import { useState } from "react";
import { ArrowLeft, MessageSquare, Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useConversations, useCreateConversation } from "@/hooks/use-conversations";
import { useStudents } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const Conversations = () => {
  const { data: conversations = [], isLoading } = useConversations();
  const { data: students = [] } = useStudents();
  const { user } = useAuth();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const [newOpen, setNewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [tab, setTab] = useState("direct");

  const getConversationName = (conv: typeof conversations[0]) => {
    if (conv.type === "group") return conv.name || "Group Chat";
    const otherMember = conv.members.find((m) => m.user_id !== user?.id);
    const otherStudent = students.find((s) => s.user_id === otherMember?.user_id);
    return otherStudent?.name || "Unknown";
  };

  const getConversationAvatar = (conv: typeof conversations[0]) => {
    if (conv.type === "group") return "👥";
    const otherMember = conv.members.find((m) => m.user_id !== user?.id);
    const otherStudent = students.find((s) => s.user_id === otherMember?.user_id);
    if (otherStudent?.profile_picture_url) return null;
    return otherStudent?.avatar || "👤";
  };

  const getConversationImage = (conv: typeof conversations[0]) => {
    if (conv.type === "group") return null;
    const otherMember = conv.members.find((m) => m.user_id !== user?.id);
    const otherStudent = students.find((s) => s.user_id === otherMember?.user_id);
    return otherStudent?.profile_picture_url || null;
  };

  const otherStudents = students.filter((s) => s.user_id && s.user_id !== user?.id);
  const filteredStudents = otherStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    const type = tab === "direct" ? "direct" as const : "group" as const;
    const convId = await createConversation.mutateAsync({
      type,
      name: type === "group" ? groupName || undefined : undefined,
      memberIds: selectedUsers,
    });
    setNewOpen(false);
    setSelectedUsers([]);
    setGroupName("");
    setSearch("");
    navigate(`/dm/${convId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-primary px-4 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <MessageSquare className="h-5 w-5 text-accent" />
            <h1 className="font-display text-xl text-primary-foreground">Messages</h1>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>New Conversation</DialogTitle>
                </DialogHeader>
                <Tabs value={tab} onValueChange={(v) => { setTab(v); setSelectedUsers([]); }}>
                  <TabsList className="w-full">
                    <TabsTrigger value="direct" className="flex-1">1-on-1</TabsTrigger>
                    <TabsTrigger value="group" className="flex-1">Group</TabsTrigger>
                  </TabsList>
                  <div className="mt-3">
                    {tab === "group" && (
                      <Input
                        placeholder="Group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="mb-3"
                      />
                    )}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search classmates..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {filteredStudents.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (tab === "direct") {
                              setSelectedUsers([s.user_id!]);
                            } else {
                              toggleUser(s.user_id!);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            selectedUsers.includes(s.user_id!)
                              ? "bg-accent/20 border border-accent"
                              : "hover:bg-muted border border-transparent"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border flex-shrink-0">
                            {s.profile_picture_url ? (
                              <img src={s.profile_picture_url} alt={s.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm">{s.avatar || "👤"}</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                          {tab === "group" && (
                            <Checkbox
                              checked={selectedUsers.includes(s.user_id!)}
                              className="ml-auto"
                            />
                          )}
                        </button>
                      ))}
                      {filteredStudents.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-4">No classmates found</p>
                      )}
                    </div>
                    <Button
                      onClick={handleCreate}
                      disabled={selectedUsers.length === 0 || createConversation.isPending}
                      className="w-full mt-3 bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {tab === "direct" ? "Start Chat" : `Create Group (${selectedUsers.length})`}
                    </Button>
                  </div>
                </Tabs>
              </DialogContent>
            </Dialog>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-10">Loading...</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-muted-foreground text-sm mt-1">Tap + to start chatting</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => {
                const name = getConversationName(conv);
                const emoji = getConversationAvatar(conv);
                const img = getConversationImage(conv);
                return (
                  <Link
                    key={conv.id}
                    to={`/dm/${conv.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden bg-secondary flex items-center justify-center border border-border flex-shrink-0">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg">{emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground truncate">{name}</p>
                        {conv.last_message && (
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {format(new Date(conv.last_message.created_at), "h:mm a")}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message?.content || "No messages yet"}
                      </p>
                    </div>
                    {conv.type === "group" && (
                      <Users className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Conversations;
