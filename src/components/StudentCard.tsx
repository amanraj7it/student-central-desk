import { Trash2, Mail, Phone } from "lucide-react";
import { Student } from "@/hooks/use-students";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface StudentCardProps {
  student: Student;
  onDelete: (id: string) => void;
}

export const StudentCard = ({ student, onDelete }: StudentCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/student/${student.id}`)}
      className="group relative bg-card rounded-xl border border-border p-5 shadow-card hover:shadow-elevated transition-shadow duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl overflow-hidden shrink-0">
            {student.profile_picture_url ? (
              <img src={student.profile_picture_url} alt={student.name} className="h-full w-full object-cover" />
            ) : (
              student.avatar
            )}
          </div>
          <div>
            <h3 className="font-display text-lg text-card-foreground leading-tight">{student.name}</h3>
            <span className="text-muted-foreground text-sm font-body">Reg #{student.register_number}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onDelete(student.id); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{student.email || "No email"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{student.phone || "No phone"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <span className="inline-flex items-center rounded-md bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
          Grade {student.grade}
        </span>
        <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
          Section {student.section}
        </span>
        {student.photos && student.photos.length > 0 && (
          <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground ml-auto">
            📷 {student.photos.length}
          </span>
        )}
      </div>
    </div>
  );
};
