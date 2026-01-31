"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RefreshPpdButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported?: number; errors?: number; error?: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/refresh-ppd", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Request failed" });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading} variant="outline">
        {loading ? "Refreshing PPD…" : "Refresh PPD (manual)"}
      </Button>
      {result && (
        <p className="text-sm text-muted-foreground">
          {result.error
            ? "Error: " + result.error
            : `Imported: ${result.imported ?? 0}, errors: ${result.errors ?? 0}`}
        </p>
      )}
    </div>
  );
}
