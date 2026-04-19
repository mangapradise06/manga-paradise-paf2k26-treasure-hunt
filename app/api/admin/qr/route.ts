import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getAdminSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const url = new URL(req.url);
  const target =
    url.searchParams.get("url") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://localhost:3000";

  try {
    const buf = await QRCode.toBuffer(target, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 2,
      width: 1024,
      color: {
        dark: "#3a2818",
        light: "#f5e6c8",
      },
    });
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="paf2k26-qr.png"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[qr] génération impossible", e);
    return NextResponse.json({ error: "Erreur QR" }, { status: 500 });
  }
}
