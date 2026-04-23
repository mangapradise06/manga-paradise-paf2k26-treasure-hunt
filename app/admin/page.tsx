"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, CardSub } from "@/components/ui/Card";
import { useToast } from "@/components/Toast";
import {
  BarChart3,
  Download,
  LogOut,
  QrCode,
  RefreshCcw,
  Users,
} from "lucide-react";

interface Stats {
  totalParticipants: number;
  completed: number;
  eligible: number;
  newsletterOptins: number;
  byStep: { standId: number; order: number; name: string; count: number }[];
}

interface ParticipantRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  pseudo: string;
  newsletter_consent: boolean;
  created_at: string;
  completed_at: string | null;
  is_winner_eligible: boolean;
  progress_count: number;
}

const PAGE_SIZE = 25;

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<ParticipantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        fetch("/api/admin/stats", { cache: "no-store" }),
        fetch(`/api/admin/participants?page=${page}&limit=${PAGE_SIZE}`, {
          cache: "no-store",
        }),
      ]);
      if (s.status === 401 || p.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const sj = (await s.json()) as Stats;
      const pj = await p.json();
      setStats(sj);
      setRows(pj.rows as ParticipantRow[]);
      setTotal(pj.total as number);
    } catch {
      toast("Erreur de chargement.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, router, toast]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const site =
    typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-screen bg-mp-sky-soft/30">
      {/* Red banner header */}
      <header className="bg-mp-red text-white shadow-mp">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">
              Dashboard organisateur
            </p>
            <h1 className="font-display italic text-2xl leading-tight sm:text-3xl">
              PAF 2K26 — Manga Paradise
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchAll}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" /> Rafraîchir
            </button>
            <a
              href="/api/admin/export"
              className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-mp-red transition hover:bg-white/90"
            >
              <Download className="h-4 w-4" /> Exporter CSV
            </a>
            <button
              type="button"
              onClick={() => setQrOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <QrCode className="h-4 w-4" /> QR code
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">

      {qrOpen && (
        <Card className="mb-6 text-center">
          <CardTitle>QR code de la chasse au trésor</CardTitle>
          <CardSub>Imprime-le pour le poser sur les stands.</CardSub>
          <div className="mt-4 flex flex-col items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/admin/qr"
              alt="QR code"
              className="h-64 w-64 rounded-lg border border-mp-sky/40"
            />
            <a
              href="/api/admin/qr"
              download="paf2k26-qr.png"
              className="btn-primary"
            >
              Télécharger le PNG
            </a>
            <p className="text-xs text-mp-ink-soft">
              Pointe vers : {site || "(site url)"}
            </p>
          </div>
        </Card>
      )}

      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Inscriptions"
          value={stats?.totalParticipants ?? "—"}
        />
        <StatCard
          icon={<BarChart3 className="h-5 w-5" />}
          label="Chasse finie"
          value={stats?.completed ?? "—"}
        />
        <StatCard
          label="Éligibles tirage"
          value={stats?.eligible ?? "—"}
        />
        <StatCard label="Opt-in newsletter" value={stats?.newsletterOptins ?? "—"} />
      </section>

      <Card className="mb-6">
        <CardTitle>Progression par étape</CardTitle>
        <CardSub>Nombre de validations enregistrées pour chaque stand.</CardSub>
        <ul className="mt-4 space-y-2">
          {(stats?.byStep ?? []).map((s) => {
            const total = stats?.totalParticipants ?? 0;
            const pct = total ? Math.round((s.count / total) * 100) : 0;
            return (
              <li key={s.standId} className="flex items-center gap-3">
                <span className="w-6 text-right font-display text-sm text-mp-ink-soft">
                  {s.order}
                </span>
                <span className="flex-1 truncate text-sm">{s.name}</span>
                <div className="relative h-2 w-40 overflow-hidden rounded-full bg-mp-sky/40">
                  <div
                    className="h-full bg-gradient-to-r from-mp-coral to-mp-orange"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-sm tabular-nums text-mp-ink-soft">
                  {s.count} / {total}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardTitle>Participants</CardTitle>
        <CardSub>
          {total} inscription{total > 1 ? "s" : ""} au total • page {page} / {pages}
        </CardSub>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-mp-sky/30 text-left text-xs uppercase tracking-wider text-mp-ink-soft">
              <tr>
                <th className="py-2">Pseudo</th>
                <th className="py-2">Nom</th>
                <th className="py-2">Email</th>
                <th className="py-2">Newsletter</th>
                <th className="py-2">Étapes</th>
                <th className="py-2">Fini</th>
                <th className="py-2">Éligible</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-mp-sky/30 last:border-none"
                >
                  <td className="py-2 font-semibold">{r.pseudo}</td>
                  <td className="py-2">
                    {r.first_name} {r.last_name}
                  </td>
                  <td className="py-2 text-mp-ink">{r.email}</td>
                  <td className="py-2">{r.newsletter_consent ? "Oui" : "—"}</td>
                  <td className="py-2 tabular-nums">{r.progress_count}/10</td>
                  <td className="py-2">
                    {r.completed_at
                      ? new Date(r.completed_at).toLocaleString("fr-FR")
                      : "—"}
                  </td>
                  <td className="py-2">
                    {r.is_winner_eligible ? (
                      <span className="chip border-mp-red/30 text-mp-red">
                        Oui
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-mp-ink-soft"
                  >
                    Aucun participant pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Précédent
          </Button>
          <Button
            variant="ghost"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Suivant
          </Button>
        </div>
      </Card>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="card flex items-center gap-3">
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mp-red/10 text-mp-red">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs uppercase tracking-widest text-mp-ink-soft">
          {label}
        </p>
        <p className="font-display text-2xl text-mp-ink">{value}</p>
      </div>
    </div>
  );
}
