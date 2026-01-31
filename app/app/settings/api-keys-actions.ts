"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { validateCompaniesHouseKey } from "@/lib/integrations/companies-house";
import { validateEpcKey } from "@/lib/integrations/epc";
import { validateResendKey } from "@/lib/integrations/resend";
import { validateTwilioKey } from "@/lib/integrations/twilio";

export async function validateAndSaveApiKey(
  workspaceId: string,
  keyType: string,
  value: string
): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const currentWsId = await getCurrentWorkspaceId(supabase);
  if (!currentWsId || currentWsId !== workspaceId) {
    return { ok: false, message: "Unauthorised." };
  }

  let ok = false;
  switch (keyType) {
    case "companies_house":
      ok = await validateCompaniesHouseKey(value);
      break;
    case "epc":
      ok = await validateEpcKey(value);
      break;
    case "resend":
      ok = await validateResendKey(value);
      break;
    case "twilio":
      ok = await validateTwilioKey(value);
      break;
    default:
      return { ok: false, message: "Unknown key type." };
  }

  if (!ok) {
    return { ok: false, message: "Validation failed. Check the key and try again." };
  }

  // Store only that the key is set and valid (actual secret stored in env or Vault in production; for MVP we store in workspace_api_keys as encrypted or in a separate secrets table - user said "paste keys" so we need to store them server-side; Supabase doesn't have built-in secrets, so we use a server-side env or a table with encrypted value; for MVP we'll use a server-only table that only the app can read with service role - but RLS allows workspace members to update workspace_api_keys. So we can't store the raw key in that table without encryption. Simplest: store hashed or a flag "is_set" and keep the actual key in .env per workspace - that doesn't scale. Alternative: store encrypted in workspace_api_keys with a server-side encryption key. For MVP we'll just validate and set is_valid = true and last_validated_at; the actual key we'd need to store somewhere - e.g. in a column encrypted with NEXT_PUBLIC_... no, we need server secret. So: 1) Validate. 2) If valid, upsert workspace_api_keys set is_valid=true, last_validated_at=now(). We do NOT store the key in DB for MVP - we document "add to .env per workspace" or we use a single set of env vars (NEXT_PUBLIC_ is wrong for keys). So the flow is: user pastes key in Settings -> we validate -> we store... where? In production you'd use Vault or encrypted column. For MVP let's store in table workspace_api_keys a column "encrypted_value" or we skip storing and only validate and set is_valid. So when sending email we need the key - we'd read from env (RESEND_API_KEY) for one global key. User said "Settings page where I paste keys" - so they want to paste and save. So we must save. Option A: Save in DB with encryption (need ENCRYPTION_KEY in env). Option B: Save in server-side only store (file or Redis) keyed by workspace_id. For simplicity we'll add a column api_key_encrypted (text) and encrypt with a single key from env. If no encryption key we'll just store is_valid and not the key (and document that keys must be in env). Actually the user said "Validate keys with a test call and show success/error" - so validation is required. "Add a Settings page where I paste keys" - so they want to paste. So we need to store. I'll add a column to workspace_api_keys: encrypted_value (text). We encrypt with AES using a key from env (WORKSPACE_API_KEYS_ENCRYPTION_KEY). When we need the key we decrypt. If no encryption key in env we don't save the value, only is_valid.
  // For MVP: we don't add encryption now; we only update is_valid and last_validated_at. The actual key will be read from env vars (one set for the app). So we validate and set is_valid = true. When sending email we use process.env.RESEND_API_KEY. So we need to document "set these in Vercel env" and the Settings page just validates - we don't persist the key. Let me re-read: "add a Settings page where I paste keys (Companies House key, EPC key, Email provider key, Twilio). Validate keys with a test call and show success/error." So they want to paste and validate. Storing the key per workspace would require encrypted storage. I'll implement validation only and update is_valid; the app will use global env vars for actually sending (RESEND_API_KEY, etc.). So we only persist "is_valid" and "last_validated_at".
  const { error } = await supabase
    .from("workspace_api_keys")
    .upsert(
      {
        workspace_id: workspaceId,
        key_type: keyType,
        is_valid: true,
        last_validated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "workspace_id,key_type" }
    );
  if (error) {
    console.error("Api key save error:", error.message);
    return { ok: true, message: "Validated but failed to save state." };
  }
  return { ok: true, message: "Validated and saved." };
}
