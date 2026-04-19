"use client";

import { Share2, Twitter, Facebook, Link2, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "./Toast";

interface Props {
  title?: string;
  text?: string;
  url?: string;
}

export function ShareButtons({
  title = "Chasse au Trésor PAF 2K26",
  text = "J'ai résolu la chasse au trésor de Manga Paradise au Play Azure Festival 2026 ! Tente ta chance aussi.",
  url,
}: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl =
    url ??
    (typeof window !== "undefined" ? window.location.origin : "");

  async function tryNative() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        /* utilisateur a annulé */
      }
    }
    // fallback : copier lien
    try {
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      toast("Lien copié dans le presse-papiers", { variant: "success" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Impossible de copier — partage manuel.", { variant: "error" });
    }
  }

  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${text} ${shareUrl}`
  )}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button onClick={tryNative} className="btn-primary" aria-label="Partager">
        <Share2 className="h-4 w-4" />
        Partager
      </button>
      <a
        href={twUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost"
        aria-label="Partager sur Twitter"
      >
        <Twitter className="h-4 w-4" />
        X / Twitter
      </a>
      <a
        href={fbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost"
        aria-label="Partager sur Facebook"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </a>
      <button
        onClick={tryNative}
        className="btn-ghost"
        aria-label="Copier le lien"
      >
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copié" : "Copier le lien"}
      </button>
    </div>
  );
}
