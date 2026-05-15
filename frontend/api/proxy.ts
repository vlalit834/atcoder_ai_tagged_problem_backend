export const config = { runtime: "edge" };

const BACKEND = "https://atcoder-tagged-backend.onrender.com";

type Rule = { match: RegExp; sMaxAge: number; swr: number };

const CACHE_RULES: Rule[] = [
  { match: /^tags$/, sMaxAge: 3600, swr: 86400 },
  { match: /^contests(\?|$)/, sMaxAge: 3600, swr: 86400 },
  { match: /^problems\/all$/, sMaxAge: 3600, swr: 86400 },
  { match: /^problems\/difficulties$/, sMaxAge: 3600, swr: 86400 },
  { match: /^problems(\?|$)/, sMaxAge: 300, swr: 3600 },
  { match: /^problems\/user\/[^/]+\/submissions(\?|$)/, sMaxAge: 300, swr: 1800 },
  { match: /^health$/, sMaxAge: 30, swr: 60 },
];

function pickRule(p: string): Rule | undefined {
  return CACHE_RULES.find((r) => r.match.test(p));
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // Path is delivered via query param `p` from the rewrite rule.
  const rawPath = url.searchParams.get("p") ?? "";
  // Forward any other query params except `p`.
  const forwardParams = new URLSearchParams();
  for (const [k, v] of url.searchParams) {
    if (k !== "p") forwardParams.append(k, v);
  }
  const qs = forwardParams.toString();
  const upstreamPath = "/" + rawPath + (qs ? `?${qs}` : "");
  const upstreamUrl = BACKEND + upstreamPath;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: { accept: "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, message: "upstream fetch failed" }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const matchKey = rawPath + (qs ? `?${qs}` : "");
  const rule = pickRule(matchKey);
  if (rule && upstream.ok && req.method === "GET") {
    headers.set(
      "Cache-Control",
      `public, s-maxage=${rule.sMaxAge}, stale-while-revalidate=${rule.swr}`,
    );
    headers.set("CDN-Cache-Control", `public, s-maxage=${rule.sMaxAge}`);
    headers.set("Vercel-CDN-Cache-Control", `public, s-maxage=${rule.sMaxAge}`);
  } else {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}