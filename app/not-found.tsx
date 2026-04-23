import Link from "next/link";
import { ToriiIcon } from "@/components/icons/ToriiIcon";

export default function NotFound() {
  return (
    <main className="relative mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="pointer-events-none absolute inset-0 sunburst-bg-soft opacity-40" aria-hidden />
      <div className="relative z-10 flex flex-col items-center">
        <ToriiIcon className="mb-4 h-16 w-16 text-mp-red opacity-70" aria-hidden />
        <p className="mb-1 font-display italic text-6xl text-mp-red mp-title-outline">
          404
        </p>
        <h1 className="font-display italic text-2xl text-mp-ink">
          Page introuvable
        </h1>
        <p className="mt-2 text-sm text-mp-ink-soft">
          Cette page n&apos;existe pas. Retourne à l&apos;accueil pour reprendre
          l&apos;aventure.
        </p>
        <Link href="/" className="btn-gradient mt-6">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
