/**
 * EPC Open Data Communities API: domestic EPC by postcode/address.
 * Auth: HTTP Basic with email:api_key (Base64).
 * https://epc.opendatacommunities.org/docs/api/domestic
 */

const BASE = "https://epc.opendatacommunities.org/api/v1/domestic";

export async function validateEpcKey(credentials: string): Promise<boolean> {
  try {
    const token = credentials.includes(":")
      ? Buffer.from(credentials).toString("base64")
      : Buffer.from(credentials + ":").toString("base64");
    const res = await fetch(`${BASE}/search?postcode=SW1A1AA&size=1`, {
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + token,
      },
    });
    return res.ok;
  } catch (e) {
    console.error("EPC validation error:", e);
    return false;
  }
}

export async function searchEpcByPostcode(
  credentials: string,
  postcode: string,
  size = 25
): Promise<{ rows?: { lmk_key: string; address: string; current_energy_rating: string }[] }> {
  const token = credentials.includes(":")
    ? Buffer.from(credentials).toString("base64")
    : Buffer.from(credentials + ":").toString("base64");
  const res = await fetch(
    `${BASE}/search?postcode=${encodeURIComponent(postcode)}&size=${size}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + token,
      },
    }
  );
  if (!res.ok) throw new Error("EPC search failed");
  return res.json();
}

export async function searchEpcByAddress(
  credentials: string,
  address: string,
  size = 25
): Promise<{ rows?: { lmk_key: string; address: string; current_energy_rating: string }[] }> {
  const token = credentials.includes(":")
    ? Buffer.from(credentials).toString("base64")
    : Buffer.from(credentials + ":").toString("base64");
  const res = await fetch(
    `${BASE}/search?address=${encodeURIComponent(address)}&size=${size}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: "Basic " + token,
      },
    }
  );
  if (!res.ok) throw new Error("EPC search failed");
  return res.json();
}
