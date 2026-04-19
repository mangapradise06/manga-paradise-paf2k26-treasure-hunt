"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/Toast";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginInner />
    </Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await r.json();
      if (!r.ok || !json.ok) {
        toast(json.error ?? "Mot de passe incorrect.", { variant: "error" });
        setLoading(false);
        return;
      }
      const next = sp.get("from") ?? "/admin";
      router.replace(next.startsWith("/admin") ? next : "/admin");
    } catch {
      toast("Erreur réseau.", { variant: "error" });
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-5">
      <div className="parchment-panel w-full p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-treasure-red text-parchment-light">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl text-parchment-ink">
            Espace organisateur
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Mot de passe"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            Se connecter
          </Button>
        </form>
      </div>
    </main>
  );
}
