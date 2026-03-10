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
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/60 [&>button]:rounded-full [&>button]:p-2 [&>button]:h-8 [&>button]:w-8">
        <img
          src={src}
          alt={alt || ""}
          className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg select-none"
        />
      </DialogContent>
    </Dialog>
  );
}
