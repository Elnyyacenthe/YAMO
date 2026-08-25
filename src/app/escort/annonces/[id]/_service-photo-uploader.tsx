"use client";

import { useState, useRef } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import { Upload, Flame, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatXAF } from "@/lib/utils";
import type { OurFileRouter } from "@/lib/uploadthing";
import { friendlyUploadError } from "@/lib/upload-errors";
import { initiateServicePhotoAction } from "@/lib/actions/payments";
import { KpayPayModal } from "@/components/kpay/kpay-pay-modal";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface Props {
  adId: string;
  price: number;
  defaultPhone?: string;
}

/**
 * Upload d'une photo service :
 *   1. L'user choisit un fichier → upload UploadThing → on récupère l'URL
 *   2. Une fois l'URL prête, on ouvre le modal K-Pay automatiquement
 *   3. K-Pay direct → applyIntent crée le Media en DB (isApproved=false)
 */
export function ServicePhotoUploader({ adId, price, defaultPhone }: Props) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);

  const { startUpload } = useUploadThing("adPhotos", {
    onClientUploadComplete: (res) => {
      setUploading(false);
      if (!res?.[0]) return;
      setPhotoUrl(res[0].url);
      // Auto-open modal
      setTimeout(() => modalTriggerRef.current?.click(), 100);
    },
    onUploadError: (err) => {
      setUploading(false);
      console.error("[upload photo service]", err);
      toast.error(friendlyUploadError(err));
    },
  });

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    await startUpload([file]);
  }

  return (
    <>
      <label
        htmlFor={`svc-${adId}`}
        className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 transition hover:border-amber-500"
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400" />
              <Upload className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-sm font-semibold">
              Ajouter une photo service ({formatXAF(price)})
            </span>
            <span className="text-xs text-muted-foreground">JPG/PNG, 5 Mo max — paiement MoMo direct</span>
          </>
        )}
        <input
          id={`svc-${adId}`}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>

      {photoUrl && (
        <KpayPayModal
          trigger={<Button ref={modalTriggerRef} className="hidden" />}
          title="Photo service — paiement"
          description={`Votre photo a été uploadée. Payez ${formatXAF(price)} pour la publier (modération admin ensuite).`}
          amount={price}
          defaultPhone={defaultPhone}
          initiate={(phone) => initiateServicePhotoAction({ adId, url: photoUrl, phone })}
          onSuccess={() => setPhotoUrl(null)}
        />
      )}
    </>
  );
}
