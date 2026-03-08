import { useState, useRef } from "react";
import { ArrowLeft, Plus, ImagePlus, FolderOpen, Trash2, Images } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAlbums, useAlbumPhotos, useCreateAlbum, useAddAlbumPhoto, useDeleteAlbum } from "@/hooks/use-albums";
import { useAuth } from "@/hooks/use-auth";

const Albums = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedAlbumId = searchParams.get("album");
  const { user, isAdmin } = useAuth();
  const { data: albums = [], isLoading } = useAlbums();
  const { data: photos = [] } = useAlbumPhotos(selectedAlbumId || "");
  const createAlbum = useCreateAlbum();
  const addPhoto = useAddAlbumPhoto();
  const deleteAlbum = useDeleteAlbum();
  const fileRef = useRef<HTMLInputElement>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);

  const handleCreate = () => {
    if (!newTitle.trim() || !user) return;
    createAlbum.mutate({ title: newTitle.trim(), description: newDesc.trim(), userId: user.id });
    setNewTitle("");
    setNewDesc("");
    setDialogOpen(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedAlbumId) return;
    if (file.size > 10 * 1024 * 1024) return;
    addPhoto.mutate({ albumId: selectedAlbumId, file, userId: user.id });
    e.target.value = "";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-primary px-4 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedAlbumId ? (
              <Button variant="ghost" size="sm" onClick={() => setSearchParams({})} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            ) : (
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Images className="h-5 w-5 text-accent" />
            <h1 className="font-display text-xl text-primary-foreground">
              {selectedAlbum ? selectedAlbum.title : "Photo Albums"}
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {!selectedAlbumId ? (
          <>
            {/* Album List */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">{albums.length} albums</p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="h-4 w-4 mr-2" /> New Album
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Album</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input placeholder="Album title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                    <Input placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                    <Button onClick={handleCreate} disabled={!newTitle.trim()} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <p className="text-center text-muted-foreground py-10">Loading...</p>
            ) : albums.length === 0 ? (
              <div className="text-center py-20">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No albums yet. Create one!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-elevated transition-shadow"
                    onClick={() => setSearchParams({ album: album.id })}
                  >
                    <div className="h-40 bg-secondary flex items-center justify-center">
                      {album.cover_url ? (
                        <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <Images className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg text-foreground">{album.title}</h3>
                      {album.description && <p className="text-sm text-muted-foreground mt-1">{album.description}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{album.photo_count} photos</p>
                    </div>
                    {(isAdmin || album.created_by === user?.id) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAlbum.mutate(album.id); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground rounded-full p-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Album Photos */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">{photos.length} photos</p>
              <Button onClick={() => fileRef.current?.click()} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <ImagePlus className="h-4 w-4 mr-2" /> Add Photo
              </Button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-20">
                <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No photos yet. Add some!</p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="rounded-lg overflow-hidden border border-border cursor-pointer hover:shadow-elevated transition-shadow"
                    onClick={() => setLightboxImg(photo.photo_url)}
                  >
                    <img src={photo.photo_url} alt="" className="w-full h-40 object-cover" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] rounded-xl" />
        </div>
      )}
    </div>
  );
};

export default Albums;
