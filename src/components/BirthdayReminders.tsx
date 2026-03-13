import { useState } from "react";
import { Cake, Send } from "lucide-react";
import { format, isToday, isBefore, addDays, parseISO, setYear } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCreateConversation, useSendDirectMessage } from "@/hooks/use-conversations";
import type { Student } from "@/hooks/use-students";

interface BirthdayRemindersProps {
  students: Student[];
}

export function BirthdayReminders({ students }: BirthdayRemindersProps) {
  const today = new Date();
  const nextWeek = addDays(today, 7);
  const { user } = useAuth();
  const navigate = useNavigate();
  const createConversation = useCreateConversation();
  const sendMessage = useSendDirectMessage();

  const [wishDialog, setWishDialog] = useState<{ open: boolean; student: (Student & { isToday: boolean }) | null }>({
    open: false,
    student: null,
  });
  const [wishMessage, setWishMessage] = useState("");
  const [sending, setSending] = useState(false);

  const upcoming = students
    .filter((s) => s.date_of_birth)
    .map((s) => {
      const dob = parseISO(s.date_of_birth!);
      const thisYearBday = setYear(dob, today.getFullYear());
      const bday = isBefore(thisYearBday, today) && !isToday(thisYearBday)
        ? setYear(dob, today.getFullYear() + 1)
        : thisYearBday;
      return { ...s, nextBirthday: bday, isToday: isToday(bday) };
    })
    .filter((s) => isBefore(s.nextBirthday, nextWeek) || s.isToday)
    .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

  if (upcoming.length === 0) return null;

  const openWishDialog = (student: (typeof upcoming)[0]) => {
    const defaultMsg = student.isToday
      ? `🎂 Happy Birthday, ${student.name}! 🎉 Wishing you an amazing day filled with joy and happiness!`
      : `🎂 Hey ${student.name}! Your birthday is coming up on ${format(student.nextBirthday, "MMM d")}! Wishing you an early happy birthday! 🎉`;
    setWishMessage(defaultMsg);
    setWishDialog({ open: true, student });
  };

  const handleSendWish = async () => {
    if (!wishDialog.student?.user_id || !user) {
      toast.error("This friend hasn't linked their account yet");
      return;
    }
    if (!wishMessage.trim()) return;

    setSending(true);
    try {
      const convId = await createConversation.mutateAsync({
        type: "direct",
        memberIds: [wishDialog.student.user_id],
      });
      await sendMessage.mutateAsync({
        conversationId: convId,
        senderId: user.id,
        content: wishMessage.trim(),
      });
      toast.success(`Birthday wishes sent to ${wishDialog.student.name}! 🎉`);
      setWishDialog({ open: false, student: null });
      navigate(`/messages/${convId}`);
    } catch (e: any) {
      toast.error("Failed to send wishes: " + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="mb-8 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Cake className="h-5 w-5 text-accent" />
          <h2 className="font-display text-xl text-foreground">Upcoming Birthdays</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {upcoming.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                s.isToday
                  ? "bg-accent/15 border border-accent/30"
                  : "bg-secondary"
              }`}
            >
              <span className="text-2xl">{s.avatar || "🎂"}</span>
              <div>
                <p className="font-medium text-sm text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.isToday ? "🎉 Today!" : format(s.nextBirthday, "MMM d")}
                </p>
              </div>
              {s.user_id && s.user_id !== user?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-1 h-8 px-2 text-accent hover:text-accent hover:bg-accent/10"
                  onClick={() => openWishDialog(s)}
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Wish</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={wishDialog.open} onOpenChange={(open) => setWishDialog({ open, student: open ? wishDialog.student : null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5 text-accent" />
              Send Birthday Wishes to {wishDialog.student?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={wishMessage}
              onChange={(e) => setWishMessage(e.target.value)}
              rows={4}
              placeholder="Write your birthday message..."
              className="resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWishDialog({ open: false, student: null })}>
                Cancel
              </Button>
              <Button onClick={handleSendWish} disabled={sending || !wishMessage.trim()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sending..." : "Send Wishes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
