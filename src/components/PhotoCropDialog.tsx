import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCw, Move } from "lucide-react";

interface PhotoCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  onCropComplete: (croppedFile: File) => void;
}

export function PhotoCropDialog({ open, onOpenChange, imageFile, onCropComplete }: PhotoCropDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImgSrc(url);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  // Draw preview
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Background
    ctx.fillStyle = "hsl(220, 25%, 18%)";
    ctx.fillRect(0, 0, size, size);

    // Transform
    ctx.translate(size / 2 + offset.x, size / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    ctx.restore();
  }, [zoom, rotation, offset]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const handleImageLoad = () => {
    drawPreview();
  };

  // Mouse/touch drag
  const handlePointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handlePointerUp = () => {
    setDragging(false);
  };

  const handleSave = async () => {
    const canvas = document.createElement("canvas");
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img) return;

    setSaving(true);

    // Draw final cropped image
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(outputSize / 2 + offset.x * (outputSize / 280), outputSize / 2 + offset.y * (outputSize / 280));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const scale = Math.max(outputSize / img.naturalWidth, outputSize / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    ctx.drawImage(img, -w / 2, -h / 2, w, h);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], imageFile?.name || "profile.jpg", { type: "image/jpeg" });
          onCropComplete(file);
        }
        setSaving(false);
        onOpenChange(false);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Adjust Profile Photo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* Preview */}
          <div
            ref={containerRef}
            className="relative cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            <canvas
              ref={canvasRef}
              width={280}
              height={280}
              className="rounded-full border-4 border-border shadow-elevated"
            />
            <div className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 pointer-events-none">
              <Move className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Hidden image for rendering */}
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt=""
              className="hidden"
              onLoad={handleImageLoad}
            />
          )}

          {/* Controls */}
          <div className="w-full space-y-4">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <ZoomOut className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[zoom]}
                onValueChange={([v]) => setZoom(v)}
                min={0.5}
                max={3}
                step={0.05}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>

            {/* Rotate */}
            <div className="flex items-center gap-3">
              <RotateCw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[rotation]}
                onValueChange={([v]) => setRotation(v)}
                min={-180}
                max={180}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10 text-right">{rotation}°</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Drag to reposition • Use sliders to zoom and rotate
          </p>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Photo"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
