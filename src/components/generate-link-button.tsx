"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateLinkButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    await fetch("/api/affiliate", { method: "POST" });
    setLoading(false);
    router.refresh();
  };

  return (
    <div>
      <p className="text-sm text-zinc-400">
        You don&apos;t have a referral link yet.
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="mt-3 rounded-md bg-[#e8b23d] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#f0c360] disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate my link"}
      </button>
    </div>
  );
}
