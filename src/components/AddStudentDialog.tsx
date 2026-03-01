import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Student } from "@/lib/students";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: Omit<Student, "id" | "avatar">) => void;
}

const EMPTY = { name: "", rollNumber: "", email: "", grade: "", section: "", phone: "" };

export const AddStudentDialog = ({ open, onOpenChange, onAdd }: AddStudentDialogProps) => {
  const [form, setForm] = useState(EMPTY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rollNumber) return;
    onAdd(form);
    setForm(EMPTY);
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
