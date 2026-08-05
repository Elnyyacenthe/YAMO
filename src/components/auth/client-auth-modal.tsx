"use client";

import { useState, useTransition } from "react";
import { UserCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientQuickAuthAction } from "@/lib/actions/auth";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Appelé après connexion/création réussie — l'appelant décide de la suite. */
  onSuccess: () => void;
}

/**
 * Mini auth CLIENT (pseudo + mot de passe, sans quitter la page) — ouvert
 * depuis Favoris/Signaler quand le visiteur n'a pas de session.
 */
export function ClientAuthModal({ open, onOpenChange, onSuccess }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function reset() {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  }

  function submit() {
    startTransition(async () => {
      const res = await clientQuickAuthAction({ mode, username, password, confirmPassword });
      if (res.ok) {
        reset();
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-primary" />
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login"
              ? "Connectez-vous avec votre pseudo pour continuer."
              : "Juste un pseudo et un mot de passe — aucune donnée personnelle requise."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="qa-username">Pseudo</Label>
            <Input
              id="qa-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={pending}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qa-password">Mot de passe</Label>
            <Input
              id="qa-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              onKeyDown={(e) => e.key === "Enter" && mode === "login" && submit()}
            />
          </div>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="qa-confirm">Confirmer le mot de passe</Label>
              <Input
                id="qa-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={pending}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>
          )}
        </div>

        <Button
          onClick={submit}
          disabled={pending || !username.trim() || !password || (mode === "signup" && !confirmPassword)}
          className="w-full"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "login" ? "Se connecter" : "Créer mon compte"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          {mode === "login" ? (
            <>
              Pas de compte ?{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => setMode("signup")}>
                Créer un compte
              </button>
            </>
          ) : (
            <>
              Déjà un compte ?{" "}
              <button type="button" className="text-primary hover:underline" onClick={() => setMode("login")}>
                Se connecter
              </button>
            </>
          )}
        </p>
      </DialogContent>
    </Dialog>
  );
}
