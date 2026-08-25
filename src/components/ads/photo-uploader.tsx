"use client";

import { useState } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import { Upload, X, Loader2, ImageOff } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { OurFileRouter } from "@/lib/uploadthing";
import { friendlyUploadError } from "@/lib/upload-errors";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  /** Passé à false quand le service d'upload n'est pas configuré côté serveur. */
  enabled?: boolean;
}

export function PhotoUploader({ value, onChange, max = 10, enabled = true }: Props) {
  const [loading, setLoading] = useState(false);

  const { startUpload } = useUploadThing("adPhotos", {
    onClientUploadComplete: (res) => {
      setLoading(false);
      if (res) onChange([...value, ...res.map((r) => r.url)]);
      toast.success(`${res?.length ?? 0} photo(s) ajoutée(s)`);
    },
    onUploadError: (err) => {
      setLoading(false);
      // Détail technique pour l'équipe, message clair pour l'utilisatrice.
      console.error("[upload photo]", err);
      toast.error(friendlyUploadError(err));
    },
  });

  // Service d'upload indisponible (token manquant) : on n'appelle jamais le
  // SDK — sinon il renvoie une erreur technique illisible.
  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center">
        <ImageOff className="h-8 w-8 text-amber-400" />
        <p className="text-sm font-medium text-amber-200">
          L&apos;ajout de photos est momentanément indisponible.
        </p>
        <p className="text-xs text-muted-foreground">
          Notre équipe est prévenue. Réessayez un peu plus tard, ou contactez le support si c&apos;est urgent.
        </p>
      </div>
    );
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Maximum ${max} photos`);
      return;
    }
    setLoading(true);
    await startUpload(Array.from(files));
  }

  return (
    <div>
      <label
        htmlFor="ad-photo-input"
        className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary"
      >
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm text-muted-foreground">
              Cliquez pour ajouter des photos ({value.length}/{max})
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">JPG, PNG · 5 Mo max</span>
          </>
        )}
        <input
          id="ad-photo-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={loading}
        />
      </label>

      {value.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {value.map((url, idx) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={url} alt={`Photo ${idx + 1}`} fill sizes="120px" className="object-cover" />
              {idx === 0 && (
                <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Principale
                </span>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => remove(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
              {/* URL embarquée dans le form via hidden input */}
              <input type="hidden" name="mediaUrls" value={url} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
