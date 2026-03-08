import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, User, Camera, MapPin, Heart, Pencil, Plus, Images, Trash2, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PhotoCropDialog } from "@/components/PhotoCropDialog";
import { EditStudentDialog } from "@/components/EditStudentDialog";
import { StudentSelfForm } from "@/components/StudentSelfForm";
import { useStudents, useAddStudentPhoto, useUpdateProfilePicture, useDeleteStudentPhoto } from "@/hooks/use-students";
import { useAlbums, useCreateAlbum } from "@/hooks/use-albums";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MyProfile = () => {
  const profilePicInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selfFormOpen, setSelfFormOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [showAlbumForm, setShowAlbumForm] = useState(false);

  const { data: students = [] } = useStudents();
  const { data: albums = [] } = useAlbums();
  const addPhoto = useAddStudentPhoto();
  const updateProfilePic = useUpdateProfilePicture();
  const deletePhoto = useDeleteStudentPhoto();
  const createAlbum = useCreateAlbum();
  const { user } = useAuth();

  const myProfile = students.find((s) => s.user_id === user?.id);
  const myAlbums = albums.filter((a) => a.created_by === user?.id);

  const handleAddGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !myProfile || file.size > 5 * 1024 * 1024) return;
    addPhoto.mutate({ studentId: myProfile.id, file });
    e.target.value = "";
  };

  const handleCreateAlbum = () => {
    if (!albumTitle.trim() || !user) return;
    createAlbum.mutate(
      { title: albumTitle, description: albumDesc || undefined, userId: user.id },
      {
        onSuccess: () => {
          setAlbumTitle("");
          setAlbumDesc("");
          setShowAlbumForm(false);
        },
      }
    );
  };

  // No profile yet
  if (!myProfile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-primary px-6 py-8">
          <div className="mx-auto max-w-4xl">
            <Link to="/">
              <Button variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4 -ml-2">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classroom
              </Button>
            </Link>
            <h1 className="font-display text-3xl text-primary-foreground">My Profile</h1>
          </div>
        </header>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-display text-2xl text-foreground mb-2">No Profile Yet</h2>
          <p className="text-muted-foreground mb-6">Create your profile to get started!</p>
          <Button onClick={() => setSelfFormOpen(true)} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4 mr-2" /> Create My Profile
          </Button>
          <StudentSelfForm open={selfFormOpen} onOpenChange={setSelfFormOpen} />
        </div>
      </div>
    );
  }

  const allPhotos = myProfile.photos || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/">
            <Button variant="ghost" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 mb-4 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Classroom
            </Button>
          </Link>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center text-4xl overflow-hidden shrink-0 border-4 border-primary-foreground/20">
                {myProfile.profile_picture_url ? (
                  <img src={myProfile.profile_picture_url} alt={myProfile.name} className="h-full w-full object-cover" />
                ) : (
                  myProfile.avatar
                )}
              </div>
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
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-primary-foreground">{myProfile.name}</h1>
              <p className="text-primary-foreground/60 font-body mt-1">
                Reg #{myProfile.register_number} · Grade {myProfile.grade} · Section {myProfile.section}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="mt-2 border-accent/50 bg-accent/10 text-primary-foreground hover:bg-accent/20"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Details
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Contact & Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl text-card-foreground">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{myProfile.email || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{myProfile.phone || "Not provided"}</span>
              </div>
              {myProfile.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{myProfile.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-card space-y-4">
            <h2 className="font-display text-xl text-card-foreground">My Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">Grade {myProfile.grade} · Section {myProfile.section}</span>
              </div>
              {myProfile.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">DOB: {myProfile.date_of_birth}</span>
                </div>
              )}
              {myProfile.blood_group && (
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Blood Group: {myProfile.blood_group}</span>
                </div>
              )}
              {myProfile.specialization && (
                <div className="flex items-center gap-3 text-sm">
                  <Star className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Specialization: {myProfile.specialization}</span>
                </div>
              )}
              {myProfile.hobby && (
                <div className="flex items-center gap-3 text-sm">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Hobby: {myProfile.hobby}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-card-foreground">My Photos ({allPhotos.length})</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => galleryInputRef.current?.click()}
              className="text-accent border-accent/30 hover:bg-accent/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Photo
            </Button>
            <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleAddGalleryPhoto} className="hidden" />
          </div>
          {allPhotos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No photos yet. Add your first photo!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allPhotos.map((photo, index) => (
                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-accent transition-all">
                  <button onClick={() => setLightboxPhoto(photo)} className="w-full h-full">
                    <img src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                  <button
                    onClick={() => deletePhoto.mutate({ photoUrl: photo })}
                    className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Albums */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-card-foreground">
              <Images className="h-5 w-5 inline mr-2 text-accent" />
              My Albums ({myAlbums.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlbumForm(!showAlbumForm)}
              className="text-accent border-accent/30 hover:bg-accent/10"
            >
              <Plus className="h-4 w-4 mr-1" /> New Album
            </Button>
          </div>

          {showAlbumForm && (
            <div className="mb-4 p-4 border border-border rounded-lg bg-secondary/50 space-y-3">
              <div>
                <Label htmlFor="album-title">Album Title *</Label>
                <Input id="album-title" value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} placeholder="e.g. Sports Day 2026" />
              </div>
              <div>
                <Label htmlFor="album-desc">Description</Label>
                <Input id="album-desc" value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} placeholder="Optional description" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateAlbum} disabled={createAlbum.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {createAlbum.isPending ? "Creating..." : "Create Album"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowAlbumForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {myAlbums.length === 0 && !showAlbumForm ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <Images className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No albums yet. Create your first album!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {myAlbums.map((album) => (
                <Link key={album.id} to={`/albums?album=${album.id}`}>
                  <div className="group rounded-lg border border-border overflow-hidden hover:ring-2 hover:ring-accent transition-all">
                    <div className="aspect-video bg-secondary flex items-center justify-center">
                      {album.cover_url ? (
                        <img src={album.cover_url} alt={album.title} className="h-full w-full object-cover" />
                      ) : (
                        <Images className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-card-foreground truncate">{album.title}</p>
                      <p className="text-xs text-muted-foreground">{album.photo_count} photos</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
        <DialogContent className="max-w-3xl p-2">
          {lightboxPhoto && <img src={lightboxPhoto} alt="Photo" className="w-full h-auto rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Crop Dialog */}
      <PhotoCropDialog
        open={cropOpen}
        onOpenChange={setCropOpen}
        imageFile={cropFile}
        onCropComplete={(croppedFile) => {
          updateProfilePic.mutate({ studentId: myProfile.id, file: croppedFile });
        }}
      />

      {/* Edit Dialog */}
      <EditStudentDialog open={editOpen} onOpenChange={setEditOpen} student={myProfile} />
    </div>
  );
};

export default MyProfile;
