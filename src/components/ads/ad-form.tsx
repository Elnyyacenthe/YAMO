"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Wand2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUploader } from "./photo-uploader";
import { VideoUploader } from "./video-uploader";
import { createAdAction, type AdActionState } from "@/lib/actions/ads";

const SERVICES = [
  "Massage",
  "GFE",
  "Striptease",
  "Couple",
  "Sortie",
  "Soirée",
  "Domination soft",
  "Tantra",
];

const DESCRIPTION_MIN = 30;

/** Modèle de description pré-rempli : une fille peut l'insérer puis l'adapter. */
const DESCRIPTION_TEMPLATE =
  "Bonjour, je suis une jeune femme douce, souriante et discrète. " +
  "Je vous accueille dans un cadre propre et climatisé pour un moment de détente et de plaisir. " +
  "Disponible en journée comme en soirée. Hygiène et respect assurés. Contactez-moi pour plus d'informations 😊";

interface Props {
  cities: { id: string; name: string }[];
  /** Numéro du compte (inscription) — figé, non modifiable depuis ce formulaire. */
  accountPhone: string;
  /** false = service d'upload non configuré → on affiche un message clair. */
  uploadsEnabled?: boolean;
}

export function AdForm({ cities, accountPhone, uploadsEnabled = true }: Props) {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [telegramOn, setTelegramOn] = useState(false);
  const [state, formAction, pending] = useActionState<AdActionState | null, FormData>(
    createAdAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      toast.success("Annonce soumise à modération ✨");
      router.push("/escort/dashboard/annonces");
    } else if (state && !state.ok) {
      toast.error(state.error);
    }
  }, [state, router]);

  function toggleService(s: string) {
    setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));
  }

  const descLeft = DESCRIPTION_MIN - description.trim().length;

  return (
    <form action={formAction} className="space-y-6">
      {/* Mini-guide d'orientation — rassure et explique en une phrase */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
        <p className="text-sm font-medium">✨ 4 étapes simples, ça prend 3 minutes :</p>
        <ol className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          <li>1️⃣ Ajoutez vos photos</li>
          <li>2️⃣ Présentez-vous en quelques mots</li>
          <li>3️⃣ Indiquez ville &amp; tarifs</li>
          <li>4️⃣ Choisissez comment on vous contacte</li>
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          Pas de panique : notre équipe vérifie chaque annonce avant sa mise en ligne. Vous pourrez
          tout modifier plus tard depuis votre espace.
        </p>
      </div>

      {/* Service d'upload indisponible : message clair, pas d'erreur technique */}
      {!uploadsEnabled && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold">L&apos;ajout de photos est momentanément indisponible</p>
            <p className="mt-1 text-amber-200/90">
              Vous pouvez déjà préparer votre texte, mais l&apos;envoi des photos ne fonctionne pas
              pour l&apos;instant. Notre équipe est prévenue — réessayez un peu plus tard.
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">1</span>
            📸 Vos photos
          </h2>
          <p className="text-xs text-muted-foreground">
            Ajoutez au moins une photo — c&apos;est ce qui attire le plus de contacts. La première
            sera l&apos;image principale. Vos photos sont vérifiées par notre équipe avant publication.
          </p>
          <PhotoUploader value={photos} onChange={setPhotos} enabled={uploadsEnabled} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">2</span>
            ✍️ Présentez-vous
          </h2>

          <div className="space-y-2">
            <Label htmlFor="title">Titre de l&apos;annonce *</Label>
            <Input
              id="title"
              name="title"
              placeholder="Ex : Belle Camerounaise à Bonapriso, douce et discrète"
              maxLength={120}
              required
            />
            <p className="text-xs text-muted-foreground">
              Une phrase courte et attirante. Ex : « Jolie métisse à Bastos, disponible ce soir ».
            </p>
            {state && !state.ok && state.fieldErrors?.title && (
              <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="description">Description *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => setDescription(DESCRIPTION_TEMPLATE)}
              >
                <Wand2 className="h-3 w-3" /> Insérer un exemple
              </Button>
            </div>
            <Textarea
              id="description"
              name="description"
              placeholder="Présentez-vous : votre style, l'ambiance, vos disponibilités, votre quartier… Pas besoin de faire long, quelques phrases suffisent."
              maxLength={3000}
              rows={6}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {descLeft > 0 ? (
                <span className="text-amber-400">
                  Encore {descLeft} caractère{descLeft > 1 ? "s" : ""} minimum — ou cliquez sur
                  « Insérer un exemple » puis adaptez-le.
                </span>
              ) : (
                <span className="text-emerald-400">✓ Parfait, votre description est suffisante.</span>
              )}
            </p>
            {state && !state.ok && state.fieldErrors?.description && (
              <p className="text-xs text-destructive">{state.fieldErrors.description[0]}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">3</span>
            📍 Où &amp; combien
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cityId">Ville *</Label>
              <Select name="cityId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une ville" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Quartier <span className="text-muted-foreground">(facultatif)</span></Label>
              <Input id="neighborhood" name="neighborhood" placeholder="Bonapriso, Bastos…" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Prix / heure (FCFA) *</Label>
              <Input id="price" name="price" type="number" min={1000} step={500} placeholder="10000" required />
              {state && !state.ok && state.fieldErrors?.price && (
                <p className="text-xs text-destructive">{state.fieldErrors.price[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceNight">Prix / nuit (FCFA) <span className="text-muted-foreground">(facultatif)</span></Label>
              <Input id="priceNight" name="priceNight" type="number" min={0} step={500} placeholder="50000" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="age">Âge *</Label>
              <Input id="age" name="age" type="number" min={18} max={80} placeholder="24" required />
              {state && !state.ok && state.fieldErrors?.age && (
                <p className="text-xs text-destructive">{state.fieldErrors.age[0]}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="gender">Genre *</Label>
              <Select name="gender" defaultValue="FEMALE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">Femme</SelectItem>
                  <SelectItem value="MALE">Homme</SelectItem>
                  <SelectItem value="TRANS">Trans</SelectItem>
                  <SelectItem value="COUPLE">Couple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Services proposés <span className="text-muted-foreground">(facultatif)</span></Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleService(s)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    services.includes(s)
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {services.map((s) => (
              <input key={s} type="hidden" name="services" value={s} />
            ))}
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <Checkbox name="incall" defaultChecked />
              <span className="text-sm">Je reçois (incall)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox name="outcall" />
              <span className="text-sm">Je me déplace (outcall)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-display text-xl font-bold">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">4</span>
            📞 Comment on vous contacte
          </h2>

          <div className="space-y-2">
            <Label>Votre numéro</Label>
            <Input value={accountPhone} disabled className="font-mono" />
            <p className="text-xs text-muted-foreground">
              C&apos;est le numéro de votre compte, partiellement masqué sur l&apos;annonce. Pour le
              changer, contactez le support.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Sur quoi peut-on vous joindre ? <span className="text-muted-foreground">(au moins un)</span></Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2">
                <Checkbox name="whatsappEnabled" defaultChecked />
                <span className="text-sm">WhatsApp</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  name="telegramEnabled"
                  checked={telegramOn}
                  onCheckedChange={(v) => setTelegramOn(v === true)}
                />
                <span className="text-sm">Telegram</span>
              </label>
            </div>
            {/* Avertissement Telegram affiché UNIQUEMENT si Telegram est coché */}
            {telegramOn && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                ⚠️ Pour que Telegram fonctionne : ouvrez Telegram →{" "}
                <strong>Réglages → Confidentialité et sécurité → Numéro de téléphone</strong>, puis
                mettez « Qui peut me trouver par mon numéro » sur <strong>Tout le monde</strong>.
                Sinon les clients ne pourront pas vous écrire.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="callPhone">
              Numéro d&apos;appel différent <span className="text-muted-foreground">(facultatif)</span>
            </Label>
            <Input id="callPhone" name="callPhone" placeholder="+237 6XX XX XX XX" />
          </div>
        </CardContent>
      </Card>

      {/* Vidéo — clairement optionnelle, placée après l'essentiel */}
      {uploadsEnabled && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg font-bold text-muted-foreground">
              🎬 Ajouter une vidéo <span className="text-sm font-normal">(facultatif — booste les contacts)</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Une courte vidéo de présentation augmente les contacts de <strong>+200 %</strong> en
              moyenne. MP4 / MOV / WEBM, 30 secondes suffisent. Pas de contenu explicite (modération).
            </p>
            <VideoUploader value={videos} onChange={setVideos} enabled={uploadsEnabled} />
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="space-y-3 p-6">
          <label className="flex items-start gap-3">
            <Checkbox name="acceptAdult" required />
            <span className="text-sm">
              Je certifie sur l&apos;honneur être <strong>majeur(e), consentant(e)</strong> et seul(e)
              auteur(e) des photos publiées. Je comprends que toute infraction (mineur, traite,
              extorsion) entraînera la suppression du compte et un signalement aux autorités.
            </span>
          </label>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending} size="lg" className="w-full">
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        Publier mon annonce
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        En cas de souci, écrivez-nous depuis <strong>Espace escort → Support</strong>, on vous aide.
      </p>
    </form>
  );
}
