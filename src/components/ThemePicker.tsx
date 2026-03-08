import { useState, useEffect } from "react";
import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ACCENT_THEMES = [
  { name: "Coral", hsl: "12 76% 61%" },
  { name: "Blue", hsl: "217 91% 60%" },
  { name: "Green", hsl: "142 71% 45%" },
  { name: "Purple", hsl: "265 83% 57%" },
  { name: "Pink", hsl: "330 81% 60%" },
  { name: "Amber", hsl: "38 92% 50%" },
  { name: "Teal", hsl: "172 66% 50%" },
  { name: "Rose", hsl: "347 77% 50%" },
];

function applyAccent(hsl: string) {
  document.documentElement.style.setProperty("--accent", hsl);
}

export function useCustomTheme() {
  useEffect(() => {
    const saved = localStorage.getItem("custom-accent");
    if (saved) applyAccent(saved);
  }, []);
}

export function ThemePicker() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(() => localStorage.getItem("custom-accent") || "12 76% 61%");

  const select = (hsl: string) => {
    applyAccent(hsl);
    localStorage.setItem("custom-accent", hsl);
    setCurrent(hsl);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="end">
        <p className="text-xs font-medium text-muted-foreground mb-2">Accent Color</p>
        <div className="grid grid-cols-4 gap-2">
          {ACCENT_THEMES.map((t) => (
            <button
              key={t.name}
              title={t.name}
              onClick={() => select(t.hsl)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                current === t.hsl ? "border-foreground scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: `hsl(${t.hsl})` }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
