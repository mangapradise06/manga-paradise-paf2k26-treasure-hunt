import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 font-display text-6xl text-treasure-red">404</p>
      <h1 className="font-display text-2xl">Carte introuvable</h1>
      <p className="mt-2 text-parchment-ink/70">
        Cette page n'existe pas dans la carte au trésor. Retournons au port.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Retour à l'accueil
      </Link>
    </main>
  );
}
