import { Cake } from "lucide-react";
import { format, isToday, isBefore, addDays, parseISO, setYear } from "date-fns";
import type { Student } from "@/hooks/use-students";

interface BirthdayRemindersProps {
  students: Student[];
}

export function BirthdayReminders({ students }: BirthdayRemindersProps) {
  const today = new Date();
  const nextWeek = addDays(today, 7);

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

  return (
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
          </div>
        ))}
      </div>
    </div>
  );
}
