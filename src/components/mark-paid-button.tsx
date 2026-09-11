"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarkPaidButton({ commissionId }: { commissionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await fetch(`/api/admin/commissions/${commissionId}`, {
      method: "PATCH",
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/20 disabled:opacity-60"
    >
      {loading ? "..." : "Mark paid"}
    </button>
  );
}
