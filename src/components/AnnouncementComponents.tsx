import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Pin, Trash2, X } from "lucide-react";
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, Announcement } from "@/hooks/use-announcements";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export const AnnouncementCreate = ({ onClose }: { onClose: () => void }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const createAnnouncement = useCreateAnnouncement();
  const { user } = useAuth();

  const handleCreate = () => {
    if (!title.trim() || !content.trim() || !user) return;
    createAnnouncement.mutate(
      { title: title.trim(), content: content.trim(), userId: user.id, isPinned },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="p-4 bg-card border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-card-foreground flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-accent" /> New Announcement
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7"><X className="h-4 w-4" /></Button>
      </div>
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" />
      </div>
      <div>
        <Label>Content</Label>
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your announcement..." rows={3} />
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={isPinned} onCheckedChange={setIsPinned} />
        <Label className="text-sm">Pin to top</Label>
      </div>
      <Button onClick={handleCreate} disabled={createAnnouncement.isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        {createAnnouncement.isPending ? "Posting..." : "Post Announcement"}
      </Button>
    </div>
  );
};

export const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => {
  const { isAdmin } = useAuth();
  const deleteAnnouncement = useDeleteAnnouncement();
  const { data: students = [] } = useStudents();
  const creator = students.find((s) => s.user_id === announcement.created_by);

  return (
    <div className={`p-4 rounded-xl border space-y-2 ${announcement.is_pinned ? "bg-accent/5 border-accent/30" : "bg-card border-border"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="h-4 w-4 text-accent" />
          {announcement.is_pinned && <Pin className="h-3 w-3 text-accent" />}
          <span className="font-display text-base text-card-foreground">{announcement.title}</span>
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteAnnouncement.mutate(announcement.id)}
            className="h-7 w-7 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.content}</p>
      <p className="text-[10px] text-muted-foreground">
        By {creator?.name || "Teacher"} · {format(new Date(announcement.created_at), "MMM d, h:mm a")}
      </p>
    </div>
  );
};
