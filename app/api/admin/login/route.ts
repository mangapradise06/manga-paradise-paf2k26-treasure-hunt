import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createAdminSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  password?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const pw = typeof body.password === "string" ? body.password : "";
  if (!pw) return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });

  // Le hash peut être stocké soit dans env ADMIN_PASSWORD_HASH, soit dans
  // la table config (key=admin_password_hash). On privilégie l'env si présent.
  let hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!hash) {
    const sb = getSupabaseAdmin();
    const { data } = await sb
      .from("config")
      .select("value")
      .eq("key", "admin_password_hash")
      .maybeSingle();
    hash = typeof data?.value === "string" ? data.value : "";
  }
  if (!hash || hash.startsWith("<PLACEHOLDER")) {
    return NextResponse.json(
      { error: "Hash admin non configuré. Définis ADMIN_PASSWORD_HASH." },
      { status: 500 }
    );
  }

  const ok = await bcrypt.compare(pw, hash);
  if (!ok) {
    // petit délai pour compliquer le brute-force
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}
