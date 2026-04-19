"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EnigmaModal, type EnigmaData } from "@/components/EnigmaModal";
import { useToast } from "@/components/Toast";

interface Props {
  standId: number | null;
}

export default function StandModalClient({ standId }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [stand, setStand] = useState<EnigmaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!standId) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/stand/${standId}`, { cache: "no-store" });
        if (r.status === 401) {
          router.replace("/inscription");
          return;
        }
        if (r.status === 403) {
          toast("Cette étape n'est pas encore accessible.", { variant: "info" });
          router.replace("/map");
          return;
        }
        const json = await r.json();
        if (!r.ok) {
          toast(json.error ?? "Impossible de charger l'énigme.", {
            variant: "error",
          });
          router.replace("/map");
          return;
        }
        setStand(json as EnigmaData);
      } catch {
        toast("Erreur réseau.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [standId, router, toast]);

  function handleClose() {
    setOpen(false);
    setTimeout(() => router.replace("/map"), 100);
  }

  function handleValidated(result: { complete: boolean; nextStandId: number | null }) {
    // Déclenche un refresh du MapView parent
    window.dispatchEvent(new CustomEvent("mp:progress-updated"));
    setOpen(false);
    setTimeout(() => {
      if (result.complete) {
        router.replace("/final");
      } else {
        router.replace("/map");
      }
    }, 200);
  }

  return (
    <EnigmaModal
      open={open}
      onClose={handleClose}
      stand={stand}
      loading={loading}
      onValidated={handleValidated}
    />
  );
}
