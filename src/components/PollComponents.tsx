import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Plus, X, Check, Lock } from "lucide-react";
import { usePolls, usePollVotes, useCreatePoll, useVotePoll, useClosePoll, Poll } from "@/hooks/use-polls";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";

export const PollCreate = ({ onClose }: { onClose: () => void }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const createPoll = useCreatePoll();
  const { user } = useAuth();

  const addOption = () => { if (options.length < 6) setOptions([...options, ""]); };
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };
  const updateOption = (i: number, val: string) => { const o = [...options]; o[i] = val; setOptions(o); };

  const handleCreate = () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2 || !user) return;
    createPoll.mutate({ question: question.trim(), options: validOptions, userId: user.id }, { onSuccess: onClose });
  };

  return (
    <div className="p-4 bg-card border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-card-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" /> Create Poll
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7"><X className="h-4 w-4" /></Button>
      </div>
      <div>
        <Label>Question</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What should we do for the class trip?" />
      </div>
      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <Input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} />
            {options.length > 2 && (
              <Button variant="ghost" size="icon" onClick={() => removeOption(i)} className="h-10 w-10 text-destructive"><X className="h-4 w-4" /></Button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button variant="outline" size="sm" onClick={addOption}><Plus className="h-3 w-3 mr-1" /> Add Option</Button>
        )}
      </div>
      <Button onClick={handleCreate} disabled={createPoll.isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        {createPoll.isPending ? "Creating..." : "Create Poll"}
      </Button>
    </div>
  );
};

export const PollCard = ({ poll }: { poll: Poll }) => {
  const { user } = useAuth();
  const { data: votes = [] } = usePollVotes(poll.id);
  const votePoll = useVotePoll();
  const closePoll = useClosePoll();
  const { data: students = [] } = useStudents();

  const myVote = votes.find((v) => v.user_id === user?.id);
  const totalVotes = votes.length;
  const creator = students.find((s) => s.user_id === poll.created_by);
  const isCreator = poll.created_by === user?.id;

  const handleVote = (optionIndex: number) => {
    if (!user || poll.is_closed) return;
    votePoll.mutate({ pollId: poll.id, userId: user.id, optionIndex });
  };

  return (
    <div className="p-4 bg-card border border-accent/20 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <span className="text-xs text-muted-foreground">Poll by {creator?.name || "Unknown"}</span>
        </div>
        {poll.is_closed && (
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded flex items-center gap-1">
            <Lock className="h-3 w-3" /> Closed
          </span>
        )}
      </div>
      <p className="font-display text-lg text-card-foreground">{poll.question}</p>
      <div className="space-y-2">
        {poll.options.map((option, i) => {
          const optionVotes = votes.filter((v) => v.option_index === i).length;
          const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
          const isMyVote = myVote?.option_index === i;

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={poll.is_closed}
              className={`relative w-full text-left rounded-lg border p-3 transition-all overflow-hidden ${
                isMyVote
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              } ${poll.is_closed ? "cursor-default" : "cursor-pointer"}`}
            >
              <div
                className="absolute inset-0 bg-accent/10 transition-all"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-sm text-card-foreground flex items-center gap-2">
                  {isMyVote && <Check className="h-3.5 w-3.5 text-accent" />}
                  {option}
                </span>
                <span className="text-xs text-muted-foreground font-medium">{pct}% ({optionVotes})</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{totalVotes} vote{totalVotes !== 1 ? "s" : ""}</span>
        {isCreator && !poll.is_closed && (
          <Button variant="ghost" size="sm" onClick={() => closePoll.mutate(poll.id)} className="text-xs text-muted-foreground">
            Close Poll
          </Button>
        )}
      </div>
    </div>
  );
};
