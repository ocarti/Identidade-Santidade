import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageLightboxProps {
  src: string | null;
  alt?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageLightbox({ src, alt, open, onOpenChange }: ImageLightboxProps) {
  if (!src) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-1">
        <img
          src={src}
          alt={alt || ""}
          className="w-full h-full max-h-[85vh] object-contain rounded-lg"
        />
      </DialogContent>
    </Dialog>
  );
}
