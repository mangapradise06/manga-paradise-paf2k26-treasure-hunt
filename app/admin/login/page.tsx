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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mp-sky-soft/40 px-5 py-10">
      <div className="pointer-events-none absolute inset-0 sunburst-bg-soft opacity-50" aria-hidden />
      <div className="mp-card relative z-10 w-full max-w-md p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-mp-coral to-mp-orange text-white shadow-mp">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-mp-coral">Admin</p>
            <h1 className="font-display italic text-2xl text-mp-red">
              Espace organisateur
            </h1>
          </div>
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
          <Button type="submit" variant="gradient" loading={loading} className="w-full">
            Se connecter
          </Button>
        </form>
      </div>
    </main>
  );
}
