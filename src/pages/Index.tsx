import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Users, GraduationCap, Camera, ImagePlus, LogOut, UserPlus, MessageCircle, Images, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentCard } from "@/components/StudentCard";
import { AddStudentDialog } from "@/components/AddStudentDialog";
import { StudentSelfForm } from "@/components/StudentSelfForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BirthdayReminders } from "@/components/BirthdayReminders";
import { useStudents, useDeleteStudent } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import { useClassPhoto, useUploadClassPhoto } from "@/hooks/use-class-photo";
import { exportStudentsPdf } from "@/lib/export-pdf";

const Index = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selfFormOpen, setSelfFormOpen] = useState(false);
  const classPhotoRef = useRef<HTMLInputElement>(null);

  const { data: students = [], isLoading } = useStudents();
  const deleteStudent = useDeleteStudent();
  const { user, isAdmin, signOut } = useAuth();
  const { data: classPhoto } = useClassPhoto();
  const uploadClassPhoto = useUploadClassPhoto();

  // Check if current user already has a profile
  const hasOwnProfile = !isAdmin && students.some((s) => s.user_id === user?.id);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.register_number.includes(search) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleClassPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 10 * 1024 * 1024) return;
    uploadClassPhoto.mutate(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-6 py-12 md:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-accent" />
              <span className="text-primary-foreground/70 font-body text-sm uppercase tracking-widest">
                Class Dashboard
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-primary-foreground/60 text-sm hidden sm:inline">
                {user?.email} {isAdmin ? "(Admin)" : ""}
              </span>
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-primary-foreground mb-2">
            My Classroom
          </h1>
          <p className="text-primary-foreground/60 font-body text-lg">
            Manage and track all friend information in one place.
          </p>
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-4 py-2">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-primary-foreground text-sm font-medium">
                {students.length} Friends
              </span>
            </div>
            <Link to="/chat">
              <div className="flex items-center gap-2 bg-accent/20 hover:bg-accent/30 transition-colors rounded-lg px-4 py-2 cursor-pointer">
                <MessageCircle className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground text-sm font-medium">Class Chat</span>
              </div>
            </Link>
            <Link to="/albums">
              <div className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-lg px-4 py-2 cursor-pointer">
                <Images className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground text-sm font-medium">Albums</span>
              </div>
            </Link>
            {isAdmin && (
              <button
                onClick={() => exportStudentsPdf(students)}
                className="flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors rounded-lg px-4 py-2 cursor-pointer"
              >
                <FileDown className="h-4 w-4 text-accent" />
                <span className="text-primary-foreground text-sm font-medium">Export PDF</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Birthday Reminders */}
        <BirthdayReminders students={students} />

        {/* Class Group Photo */}
        <div className="mb-8">
          <h2 className="font-display text-2xl text-foreground mb-4">Class Group Photo</h2>
          {classPhoto ? (
            <div className="relative group rounded-xl overflow-hidden border border-border shadow-card">
              <img src={classPhoto} alt="Class group" className="w-full h-64 object-cover" />
              {isAdmin && (
                <button
                  onClick={() => classPhotoRef.current?.click()}
                  className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera className="h-8 w-8 text-background" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => isAdmin && classPhotoRef.current?.click()}
              className={`w-full h-48 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 bg-card ${isAdmin ? "hover:border-accent transition-colors cursor-pointer" : "cursor-default"}`}
            >
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">
                {isAdmin ? "Upload a class group photo" : "No class photo yet"}
              </span>
            </button>
          )}
          {isAdmin && <input ref={classPhotoRef} type="file" accept="image/*" onChange={handleClassPhoto} className="hidden" />}
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
          {isAdmin && (
            <Button onClick={() => setDialogOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          )}
          {!isAdmin && !hasOwnProfile && (
            <Button onClick={() => setSelfFormOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add My Info
            </Button>
          )}
        </div>

        {/* Student Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Loading friends...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No friends found.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onDelete={isAdmin ? (id) => deleteStudent.mutate(id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {isAdmin && <AddStudentDialog open={dialogOpen} onOpenChange={setDialogOpen} />}
      {!isAdmin && <StudentSelfForm open={selfFormOpen} onOpenChange={setSelfFormOpen} />}
    </div>
  );
};

export default Index;
