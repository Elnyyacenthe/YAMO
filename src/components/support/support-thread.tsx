"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateReactHelpers } from "@uploadthing/react";
import { Loader2, Send, MessageSquare, Paperclip, X, FileText } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { sendSupportMessageAction } from "@/lib/actions/support";
import type { OurFileRouter } from "@/lib/uploadthing";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export interface SupportThreadMessage {
  id: string;
  body: string;
  isAdmin: boolean;
  createdAt: Date;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}

function isImageFile(name?: string | null) {
  return !!name && /\.(jpe?g|png|gif|webp|avif)$/i.test(name);
}

function Attachment({ url, name }: { url: string; name?: string | null }) {
  if (isImageFile(name)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
        <Image
          src={url}
          alt={name ?? "Pièce jointe"}
          width={220}
          height={220}
          className="max-h-56 w-auto rounded-lg border border-border/60 object-cover"
        />
      </a>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-sm hover:border-primary/50"
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{name ?? "Document joint"}</span>
    </a>
  );
}

export function SupportThread({ messages }: { messages: SupportThreadMessage[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const { startUpload, isUploading } = useUploadThing("supportAttachment", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) setAttachment({ url: res[0].url, name: res[0].name });
    },
    onUploadError: (err) => {
      toast.error(err.message);
    },
  });

  function submit() {
    const trimmed = body.trim();
    if (!trimmed && !attachment) return;
    startTransition(async () => {
      const res = await sendSupportMessageAction({
        body: trimmed,
        attachmentUrl: attachment?.url,
        attachmentName: attachment?.name,
      });
      if (res.ok) {
        setBody("");
        setAttachment(null);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const busy = pending || isUploading;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {messages.length === 0 ? (
          <Card className="p-10 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun message pour l'instant. Écrivez à l'équipe Affinité ci-dessous — on vous répond
              généralement sous 24h ouvrées.
            </p>
          </Card>
        ) : (
          messages.map((m) => (
            <Card
              key={m.id}
              className={m.isAdmin ? "border-primary/40 bg-primary/5" : "border-border/60"}
            >
              <CardContent className="space-y-1.5 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <strong className={m.isAdmin ? "text-primary" : ""}>
                    {m.isAdmin ? "🛡️ Équipe Affinité" : "Vous"}
                  </strong>
                  <span>{timeAgo(m.createdAt)}</span>
                </div>
                {m.body && <p className="whitespace-pre-wrap text-sm">{m.body}</p>}
                {m.attachmentUrl && <Attachment url={m.attachmentUrl} name={m.attachmentName} />}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Écrivez votre message…"
            rows={3}
            maxLength={3000}
            disabled={busy}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
          />

          {attachment && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs">
              <Paperclip className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="flex-1 truncate">{attachment.name}</span>
              <button type="button" onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label
                htmlFor="support-attachment-input"
                className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="h-4 w-4" />
                {isUploading ? "Envoi…" : "Joindre un fichier"}
              </label>
              <input
                id="support-attachment-input"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) startUpload([file]);
                  e.target.value = "";
                }}
              />
              <p className="hidden text-xs text-muted-foreground sm:block">
                Ctrl/Cmd + Entrée pour envoyer
              </p>
            </div>
            <Button onClick={submit} disabled={busy || (!body.trim() && !attachment)} size="sm">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Envoyer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
