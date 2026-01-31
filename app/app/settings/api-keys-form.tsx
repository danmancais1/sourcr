"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateAndSaveApiKey } from "./api-keys-actions";

const KEY_TYPES = [
  { id: "companies_house", label: "Companies House API key", placeholder: "Your API key" },
  { id: "epc", label: "EPC Open Data (email:key Base64 or paste key)", placeholder: "API key" },
  { id: "resend", label: "Resend API key (email)", placeholder: "re_xxxx" },
  { id: "twilio", label: "Twilio (Account SID:Auth Token or paste key)", placeholder: "Credentials" },
] as const;

export function ApiKeysForm({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, { ok: boolean; message: string }>>({});

  async function handleSubmit(keyType: string, value: string) {
    if (!value.trim()) return;
    setLoading(keyType);
    setResult((r) => ({ ...r, [keyType]: { ok: false, message: "Validating…" } }));
    const res = await validateAndSaveApiKey(workspaceId, keyType, value.trim());
    setResult((r) => ({ ...r, [keyType]: res }));
    setLoading(null);
  }

  return (
    <div className="space-y-6">
      {KEY_TYPES.map(({ id, label, placeholder }) => (
        <div key={id} className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem(id) as HTMLInputElement;
              handleSubmit(id, input.value);
            }}
          >
            <Input id={id} name={id} type="password" placeholder={placeholder} className="max-w-md" />
            <Button type="submit" disabled={loading === id}>
              {loading === id ? "Validating…" : "Validate & save"}
            </Button>
          </form>
          {result[id] && (
            <p className={`text-sm ${result[id].ok ? "text-green-600" : "text-destructive"}`}>
              {result[id].message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
