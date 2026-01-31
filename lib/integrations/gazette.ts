/**
 * The Gazette: insolvency-related notices search.
 * Public data feed / search. No auth required for basic search; rate limits may apply.
 * https://www.thegazette.co.uk/
 */

const BASE = "https://www.thegazette.co.uk";

export async function searchGazetteInsolvency(query: string): Promise<{ results?: { title: string; link: string; description: string }[] }> {
  try {
    const res = await fetch(
      `${BASE}/search?q=${encodeURIComponent(query)}&category-code=insolvency`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return { results: [] };
    const data = await res.json();
    return { results: data.results ?? [] };
  } catch (e) {
    console.error("Gazette search error:", e);
    return { results: [] };
  }
}

export async function searchGazetteByCompanyName(companyName: string): Promise<{ results?: unknown[] }> {
  return searchGazetteInsolvency(companyName);
}

export async function searchGazetteByDirectorName(directorName: string): Promise<{ results?: unknown[] }> {
  return searchGazetteInsolvency(directorName);
}
