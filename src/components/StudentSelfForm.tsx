import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, User } from "lucide-react";
import { useAddStudent } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";

interface StudentSelfFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY = { name: "", registerNumber: "", email: "", grade: "", section: "", phone: "", dateOfBirth: "", bloodGroup: "", address: "", specialization: "", hobby: "" };

export const StudentSelfForm = ({ open, onOpenChange }: StudentSelfFormProps) => {
  const [form, setForm] = useState(EMPTY);
  const [profileFile, setProfileFile] = useState<File | undefined>();
  const [preview, setPreview] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addStudent = useAddStudent();
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.registerNumber) return;
    addStudent.mutate(
      {
        name: form.name,
        register_number: form.registerNumber,
        email: form.email || user?.email || undefined,
        grade: form.grade || undefined,
        section: form.section || undefined,
        phone: form.phone || undefined,
        date_of_birth: form.dateOfBirth || undefined,
        blood_group: form.bloodGroup || undefined,
        address: form.address || undefined,
        specialization: form.specialization || undefined,
        hobby: form.hobby || undefined,
        profile_picture_file: profileFile,
        user_id: user?.id,
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          setProfileFile(undefined);
          setPreview(undefined);
          onOpenChange(false);
        },
      }
    );
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add My Information</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-20 w-20 rounded-full bg-secondary border-2 border-dashed border-border hover:border-accent transition-colors flex items-center justify-center overflow-hidden group"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground group-hover:text-accent transition-colors" />
              )}
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="h-5 w-5 text-background" />
              </div>
            </button>
            <span className="text-xs text-muted-foreground">Click to upload photo</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={form.name} onChange={set("name")} placeholder="Your full name" />
            </div>
            <div>
              <Label htmlFor="roll">Register Number *</Label>
              <Input id="roll" value={form.registerNumber} onChange={set("registerNumber")} placeholder="006" />
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
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
            </div>
            <div>
              <Label htmlFor="blood">Blood Group</Label>
              <Input id="blood" value={form.bloodGroup} onChange={set("bloodGroup")} placeholder="A+" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={set("address")} placeholder="123 Main St" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="specialization">Specialization</Label>
              <Input id="specialization" value={form.specialization} onChange={set("specialization")} placeholder="e.g. Computer Science" />
            </div>
            <div className="col-span-2">
              <Label htmlFor="hobby">Hobby</Label>
              <Input id="hobby" value={form.hobby} onChange={set("hobby")} placeholder="e.g. Reading, Cricket" />
            </div>
          </div>
          <Button type="submit" disabled={addStudent.isPending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            {addStudent.isPending ? "Saving..." : "Save My Information"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
