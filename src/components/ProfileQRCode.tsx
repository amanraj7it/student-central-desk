import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { useRef } from "react";

interface ProfileQRCodeProps {
  studentId: string;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProfileQRCode = ({ studentId, studentName, open, onOpenChange }: ProfileQRCodeProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const profileUrl = `${window.location.origin}/student/${studentId}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement("a");
      link.download = `${studentName}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">{studentName}'s QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div ref={qrRef} className="p-4 bg-white rounded-xl">
            <QRCodeSVG
              value={profileUrl}
              size={200}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">Scan to view profile</p>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1.5" /> Download QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const QRCodeButton = ({ onClick }: { onClick: () => void }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="border-accent/50 bg-accent/10 text-primary-foreground hover:bg-accent/20"
  >
    <QrCode className="h-3.5 w-3.5 mr-1.5" /> QR Code
  </Button>
);
