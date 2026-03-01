import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Student } from "@/lib/students";
import { Camera, User } from "lucide-react";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Student, "id" | "avatar">) => void;
}

const EMPTY = { name: "", rollNumber: "", email: "", grade: "", section: "", phone: "" };

export const AddStudentDialog = ({ open, onOpenChange, onAdd }: AddStudentDialogProps) => {
  const [form, setForm] = useState(EMPTY);
  const [profilePicture, setProfilePicture] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return; // 5MB limit
    const reader = new FileReader();
    reader.onloadend = () => setProfilePicture(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber) return;
    onAdd({ ...form, profilePicture });
    setForm(EMPTY);
    setProfilePicture(undefined);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-20 w-20 rounded-full bg-secondary border-2 border-dashed border-border hover:border-accent transition-colors flex items-center justify-center overflow-hidden group"
            >
              {profilePicture ? (
                <img src={profilePicture} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground group-hover:text-accent transition-colors" />
              )}
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="h-5 w-5 text-background" />
              </div>
            </button>
            <span className="text-xs text-muted-foreground">Click to upload photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={set("name")} placeholder="John Doe" />
            </div>
            <div>
              <Label htmlFor="roll">Roll Number *</Label>
              <Input id="roll" value={form.rollNumber} onChange={set("rollNumber")} placeholder="006" />
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" value={form.grade} onChange={set("grade")} placeholder="A" />
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Input id="section" value={form.section} onChange={set("section")} placeholder="A" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="+91 ..." />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="student@school.edu" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Add Student
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
