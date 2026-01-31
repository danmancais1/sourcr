/**
 * Companies House API: company search and profile.
 * Auth: Basic with API key only (no username).
 * https://developer.company-information.service.gov.uk/
 */

const BASE = "https://api.company-information.service.gov.uk";

export async function validateCompaniesHouseKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/search/companies?q=test&items_per_page=1`, {
      headers: {
        Authorization: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
      },
    });
    return res.ok;
  } catch (e) {
    console.error("Companies House validation error:", e);
    return false;
  }
}

export async function searchCompanies(
  apiKey: string,
  q: string,
  itemsPerPage = 10
): Promise<{ items?: { company_number: string; title: string; company_status: string }[] }> {
  const res = await fetch(
    `${BASE}/search/companies?q=${encodeURIComponent(q)}&items_per_page=${itemsPerPage}`,
    {
      headers: {
        Authorization: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
      },
    }
  );
  if (!res.ok) throw new Error("Companies House search failed");
  return res.json();
}

export async function getCompanyProfile(
  apiKey: string,
  companyNumber: string
): Promise<{ company_name?: string; company_status?: string; type?: string }> {
  const res = await fetch(`${BASE}/company/${encodeURIComponent(companyNumber)}`, {
    headers: {
      Authorization: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
    },
  });
  if (!res.ok) throw new Error("Companies House profile failed");
  return res.json();
}

export async function getCompanyCharges(
  apiKey: string,
  companyNumber: string
): Promise<{ items?: unknown[]; total_count?: number }> {
  const res = await fetch(
    `${BASE}/company/${encodeURIComponent(companyNumber)}/charges`,
    {
      headers: {
        Authorization: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
      },
    }
  );
  if (!res.ok) throw new Error("Companies House charges failed");
  return res.json();
}

export async function getCompanyInsolvency(
  apiKey: string,
  companyNumber: string
): Promise<{ status?: string; details?: unknown[] } | null> {
  const res = await fetch(
    `${BASE}/company/${encodeURIComponent(companyNumber)}/insolvency`,
    {
      headers: {
        Authorization: "Basic " + Buffer.from(apiKey + ":").toString("base64"),
      },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Companies House insolvency failed");
  return res.json();
}
