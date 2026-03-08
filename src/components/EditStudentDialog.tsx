import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useUpdateStudent, Student } from "@/hooks/use-students";

interface EditStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

export const EditStudentDialog = ({ open, onOpenChange, student }: EditStudentDialogProps) => {
  const [form, setForm] = useState({
    name: "",
    register_number: "",
    email: "",
    grade: "",
    section: "",
    phone: "",
    date_of_birth: "",
    blood_group: "",
    address: "",
    parent_name: "",
    parent_phone: "",
  });
  const updateStudent = useUpdateStudent();

  useEffect(() => {
    if (open && student) {
      setForm({
        name: student.name || "",
        register_number: student.register_number || "",
        email: student.email || "",
        grade: student.grade || "",
        section: student.section || "",
        phone: student.phone || "",
        date_of_birth: student.date_of_birth || "",
        blood_group: student.blood_group || "",
        address: student.address || "",
        parent_name: student.parent_name || "",
        parent_phone: student.parent_phone || "",
      });
    }
  }, [open, student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.register_number) return;
    updateStudent.mutate(
      {
        id: student.id,
        name: form.name,
        register_number: form.register_number,
        email: form.email || null,
        grade: form.grade || null,
        section: form.section || null,
        phone: form.phone || null,
        date_of_birth: form.date_of_birth || null,
        blood_group: form.blood_group || null,
        address: form.address || null,
        parent_name: form.parent_name || null,
        parent_phone: form.parent_phone || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          import("sonner").then(({ toast }) => toast.success("Details updated!"));
        },
      }
    );
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input id="edit-name" value={form.name} onChange={set("name")} />
            </div>
            <div>
              <Label htmlFor="edit-reg">Register Number *</Label>
              <Input id="edit-reg" value={form.register_number} onChange={set("register_number")} />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <Label htmlFor="edit-grade">Grade</Label>
              <Input id="edit-grade" value={form.grade} onChange={set("grade")} />
            </div>
            <div>
              <Label htmlFor="edit-section">Section</Label>
              <Input id="edit-section" value={form.section} onChange={set("section")} />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={form.phone} onChange={set("phone")} />
            </div>
            <div>
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input id="edit-dob" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} />
            </div>
            <div>
              <Label htmlFor="edit-blood">Blood Group</Label>
              <Input id="edit-blood" value={form.blood_group} onChange={set("blood_group")} />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" value={form.address} onChange={set("address")} />
            </div>
            <div>
              <Label htmlFor="edit-parent">Parent/Guardian Name</Label>
              <Input id="edit-parent" value={form.parent_name} onChange={set("parent_name")} />
            </div>
            <div>
              <Label htmlFor="edit-pphone">Parent Phone</Label>
              <Input id="edit-pphone" value={form.parent_phone} onChange={set("parent_phone")} />
            </div>
          </div>
          <Button type="submit" disabled={updateStudent.isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {updateStudent.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
