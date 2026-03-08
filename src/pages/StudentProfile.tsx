import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, User, Camera, Plus, MapPin, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PhotoCropDialog } from "@/components/PhotoCropDialog";
import { useStudents, useAddStudentPhoto, useUpdateProfilePicture } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const { data: students = [] } = useStudents();
  const addPhoto = useAddStudentPhoto();
  const updateProfilePic = useUpdateProfilePicture();
  const { user, isAdmin } = useAuth();
  const student = students.find((s) => s.id === id);

  const isOwner = student?.user_id === user?.id;
  const canEdit = isAdmin || isOwner;

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">Friend not found.</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) return;
    addPhoto.mutate({ studentId: student.id, file });
    e.target.value = "";
  };

  const allPhotos = student.photos || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classroom
          </Button>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-4xl overflow-hidden shrink-0 border-4 border-primary-foreground/20">
                {student.profile_picture_url ? (
                  <img src={student.profile_picture_url} alt={student.name} className="h-full w-full object-cover" />
                ) : (
                  student.avatar
                )}
              </div>
              {canEdit && (
                <>
                  <button
                    onClick={() => profilePicInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera className="h-6 w-6 text-background" />
                  </button>
                  <input
                    ref={profilePicInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || file.size > 5 * 1024 * 1024) return;
                      setCropFile(file);
                      setCropOpen(true);
                      e.target.value = "";
                    }}
                  />
                </>
              )}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-primary-foreground">{student.name}</h1>
              <p className="text-primary-foreground/60 font-body mt-1">
                Reg #{student.register_number} · Grade {student.grade} · Section {student.section}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl text-card-foreground">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{student.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{student.phone || "Not provided"}</span>
              </div>
              {student.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{student.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl text-card-foreground">Friend Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">
                  Grade {student.grade} · Section {student.section}
                </span>
              </div>
              {student.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">DOB: {student.date_of_birth}</span>
                </div>
              )}
              {student.blood_group && (
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Blood Group: {student.blood_group}</span>
                </div>
              )}
              {student.parent_name && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">
                    Parent: {student.parent_name}
                    {student.parent_phone && ` (${student.parent_phone})`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-card-foreground">
              Photo Gallery ({allPhotos.length})
            </h2>
            {canEdit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-accent border-accent/30 hover:bg-accent/10"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Photo
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAddPhoto} className="hidden" />
              </>
            )}
          </div>

          {allPhotos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No photos yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setLightboxPhoto(photo)}
                  className="aspect-square rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-accent transition-all"
                >
                  <img src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
        <DialogContent className="max-w-3xl p-2">
          {lightboxPhoto && (
            <img src={lightboxPhoto} alt="Student photo" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentProfile;
