import { useState, useRef } from "react";
import { Search, Plus, Users, GraduationCap, Camera, ImagePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Student, INITIAL_STUDENTS, getRandomAvatar } from "@/lib/students";
import { StudentCard } from "@/components/StudentCard";
import { AddStudentDialog } from "@/components/AddStudentDialog";

interface IndexProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
}

const Index = ({ students, setStudents }: IndexProps) => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classPhoto, setClassPhoto] = useState<string | undefined>();
  const classPhotoRef = useRef<HTMLInputElement>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.registerNumber.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const addStudent = (data: Omit<Student, "id" | "avatar">) => {
    setStudents((prev) => [
      ...prev,
      { ...data, id: Date.now().toString(), avatar: getRandomAvatar() },
    ]);
    setDialogOpen(false);
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handleClassPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => setClassPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="border-b border-border bg-primary px-6 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-accent" />
            <span className="text-primary-foreground/70 font-body text-sm uppercase tracking-widest">
              Class Dashboard
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-primary-foreground mb-2">
            My Classroom
          </h1>
          <p className="text-primary-foreground/60 font-body text-lg">
            Manage and track all student information in one place.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-2">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-primary-foreground text-sm font-medium">
                {students.length} Students
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Class Group Photo */}
        <div className="mb-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Class Group Photo</h2>
          {classPhoto ? (
            <div className="relative group rounded-xl overflow-hidden border border-border shadow-card">
              <img src={classPhoto} alt="Class group" className="w-full h-64 object-cover" />
              <button
                onClick={() => classPhotoRef.current?.click()}
                className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera className="h-8 w-8 text-background" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => classPhotoRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-border hover:border-accent transition-colors flex flex-col items-center justify-center gap-3 bg-card"
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">Upload a class group photo</span>
            </button>
          )}
          <input ref={classPhotoRef} type="file" accept="image/*" onChange={handleClassPhoto} className="hidden" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, register number, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Button onClick={() => setDialogOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Student Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No students found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((student) => (
              <StudentCard key={student.id} student={student} onDelete={deleteStudent} />
            ))}
          </div>
        )}
      </div>

      <AddStudentDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addStudent} />
    </div>
  );
};

export default Index;
