/**
 * Companies House Public Data API client.
 * Basic Auth: username = API key, password blank.
 * https://developer.company-information.service.gov.uk/
 */

const DEFAULT_BASE = "https://api.company-information.service.gov.uk";

function getBaseUrl(): string {
  return process.env.COMPANIES_HOUSE_BASE_URL ?? DEFAULT_BASE;
}

function getAuthHeader(): string {
  const apiKey = process.env.COMPANIES_HOUSE_API_KEY;
  if (!apiKey) {
    throw new Error("COMPANIES_HOUSE_API_KEY is not set");
  }
  const encoded = Buffer.from(`${apiKey}:`, "utf8").toString("base64");
  return `Basic ${encoded}`;
}

const MAX_RETRIES_429 = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Fetch from Companies House API with Basic Auth and optional 429 retry.
 */
export async function chFetch<T>(path: string): Promise<T> {
  const base = getBaseUrl().replace(/\/$/, "");
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const auth = getAuthHeader();

  let lastRes: Response | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES_429; attempt++) {
    const res = await fetch(url, {
      headers: { Authorization: auth },
      cache: "no-store",
    });
    lastRes = res;

    if (res.status === 429 && attempt < MAX_RETRIES_429) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Companies House API ${res.status}: ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`
      );
    }

    return res.json() as Promise<T>;
  }

  const text = lastRes ? await lastRes.text() : "";
  throw new Error(
    `Companies House API 429 after ${MAX_RETRIES_429 + 1} attempts${text ? ` — ${text.slice(0, 200)}` : ""}`
  );
}

export type CompanyProfile = {
  company_name?: string;
  company_number?: string;
  company_status?: string;
  type?: string;
  date_of_creation?: string;
  [key: string]: unknown;
};

export type InsolvencyResponse = {
  status?: string;
  details?: { type?: string; date?: string; [key: string]: unknown }[];
  [key: string]: unknown;
} | null;

export type ChargesResponse = {
  items?: { id?: string; [key: string]: unknown }[];
  total_count?: number;
  [key: string]: unknown;
};

export type FilingHistoryResponse = {
  items?: { transaction_id?: string; date?: string; [key: string]: unknown }[];
  total_count?: number;
  [key: string]: unknown;
};

export type CompanySearchResult = {
  items?: { company_number?: string; title?: string; company_status?: string; [key: string]: unknown }[];
  [key: string]: unknown;
};

export async function getCompanyProfile(companyNumber: string): Promise<CompanyProfile> {
  return chFetch<CompanyProfile>(`/company/${encodeURIComponent(companyNumber)}`);
}

export async function getInsolvency(companyNumber: string): Promise<InsolvencyResponse> {
  const base = getBaseUrl().replace(/\/$/, "");
  const url = `${base}/company/${encodeURIComponent(companyNumber)}/insolvency`;
  const auth = getAuthHeader();
  const res = await fetch(url, { headers: { Authorization: auth }, cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Companies House API ${res.status}: ${res.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`
    );
  }
  return res.json() as Promise<InsolvencyResponse>;
}

export async function getCharges(companyNumber: string): Promise<ChargesResponse> {
  return chFetch<ChargesResponse>(
    `/company/${encodeURIComponent(companyNumber)}/charges?items_per_page=100`
  );
}

export async function getFilingHistory(companyNumber: string): Promise<FilingHistoryResponse> {
  return chFetch<FilingHistoryResponse>(
    `/company/${encodeURIComponent(companyNumber)}/filing-history?items_per_page=100`
  );
}

export async function searchCompanies(q: string): Promise<CompanySearchResult> {
  return chFetch<CompanySearchResult>(
    `/search/companies?q=${encodeURIComponent(q)}&items_per_page=25`
  );
}
