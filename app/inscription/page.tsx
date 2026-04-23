"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { ArrowLeft, Info } from "lucide-react";
import { ToriiIcon } from "@/components/icons/ToriiIcon";
import { Sakura } from "@/components/icons/Sakura";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  pseudo?: string;
  rgpd?: string;
}

export default function InscriptionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [rgpd, setRgpd] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const errs: FieldErrors = {};
    if (!firstName.trim()) errs.firstName = "Prénom requis";
    if (!lastName.trim()) errs.lastName = "Nom requis";
    if (!pseudo.trim()) errs.pseudo = "Choisis un pseudo";
    if (!EMAIL_RE.test(email.trim())) errs.email = "Email invalide";
    if (!rgpd) errs.rgpd = "Nécessaire pour participer";
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    let res: Response;
    try {
      res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          pseudo: pseudo.trim(),
          rgpd,
          newsletter,
        }),
      });
    } catch {
      toast("Erreur réseau, réessaie.", { variant: "error" });
      setLoading(false);
      return;
    }

    let json: { ok?: boolean; error?: string; field?: keyof FieldErrors } = {};
    try {
      json = await res.json();
    } catch {
      // Réponse non-JSON (typiquement page d'erreur HTML d'un 500 non catché côté serveur).
    }

    if (!res.ok || !json.ok) {
      let msg = json.error ?? `Inscription impossible (${res.status}).`;
      if (res.status === 409 && json.field === "email") {
        msg =
          "Cet email a déjà été utilisé pour une participation. Si tu penses à un bug, contacte un bénévole sur place.";
      }
      if (json.field) setErrors((prev) => ({ ...prev, [json.field!]: msg }));
      toast(msg, { variant: "error" });
      setLoading(false);
      return;
    }
    router.push("/onboarding");
  }

  return (
    <main className="relative mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8 sm:py-12">
      {/* Décor sakura */}
      <Sakura
        className="pointer-events-none absolute -top-2 right-4 opacity-70 sm:right-8"
        size={40}
        aria-hidden="true"
      />
      <Sakura
        className="pointer-events-none absolute bottom-16 left-2 opacity-50 sm:left-6"
        size={28}
        aria-hidden="true"
      />

      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-mp-ink-soft hover:text-mp-red"
      >
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      {/* Ruban gradient header */}
      <div className="mp-banner mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
            <ToriiIcon size={22} color="#ffffff" />
          </div>
          <h1 className="font-display text-3xl italic sm:text-4xl">
            Inscription
          </h1>
        </div>
        <p className="mt-1 text-sm text-white/90 sm:text-base">
          Une minute et tu pars à l&apos;aventure. On garde tes coordonnées au
          chaud uniquement pour le tirage au sort.
        </p>
      </div>

      <div className="mp-card p-6 sm:p-8">
        <div
          role="note"
          className="mb-5 flex items-start gap-2 rounded-2xl border border-mp-coral/30 bg-mp-coral/10 p-3 text-sm text-mp-ink"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-mp-coral" aria-hidden />
          <p>
            <span className="font-semibold">Une seule participation par
            adresse email.</span>{" "}
            Prends le temps de bien renseigner tes infos.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Prénom"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              required
            />
            <Input
              label="Nom"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            hint="Sert uniquement à te contacter si tu gagnes."
            required
          />
          <Input
            label="Pseudo"
            name="pseudo"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            error={errors.pseudo}
            maxLength={40}
            hint="C'est ce nom qui s'affichera sur le tableau des vainqueurs."
            required
          />

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={rgpd}
              onChange={(e) => setRgpd(e.target.checked)}
              className="mt-1 h-4 w-4 accent-mp-red"
              aria-describedby="rgpd-hint"
            />
            <span id="rgpd-hint" className="text-mp-ink">
              J&apos;accepte que mes données soient utilisées pour l&apos;animation de la
              chasse au trésor et pour me contacter en cas de gain. (obligatoire)
              {errors.rgpd && (
                <span className="mt-1 block text-xs text-mp-red">
                  {errors.rgpd}
                </span>
              )}
            </span>
          </label>

          <label className="flex items-start gap-2 text-sm text-mp-ink">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-1 h-4 w-4 accent-mp-red"
            />
            <span>
              Je souhaite recevoir la newsletter Manga Paradise (événements,
              actus, offres spéciales). Désinscription à tout moment.
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full px-6 py-3 text-base sm:w-auto"
          >
            <ToriiIcon size={18} color="#ffffff" />
            Lancer l&apos;aventure
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-xs text-mp-ink-soft">
        En t&apos;inscrivant tu acceptes que Manga Paradise (association loi 1901)
        conserve tes données pendant la durée de l&apos;événement. Droit d&apos;accès, de
        rectification et de suppression :{" "}
        <a href="mailto:lucas.protin@manga-paradise.fr" className="underline">
          lucas.protin@manga-paradise.fr
        </a>
        .
      </p>
    </main>
  );
}
