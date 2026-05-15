export const config = { runtime: "edge" };

const BACKEND = "https://atcoder-tagged-backend.onrender.com";

type Rule = { match: RegExp; sMaxAge: number; swr: number };

const CACHE_RULES: Rule[] = [
  { match: /^\/tags$/, sMaxAge: 3600, swr: 86400 },
  { match: /^\/contests(\?|$)/, sMaxAge: 3600, swr: 86400 },
  { match: /^\/problems\/all$/, sMaxAge: 3600, swr: 86400 },
  { match: /^\/problems\/difficulties$/, sMaxAge: 3600, swr: 86400 },
  { match: /^\/problems(\?|$)/, sMaxAge: 300, swr: 3600 },
  {
    match: /^\/problems\/user\/[^/]+\/submissions(\?|$)/,
    sMaxAge: 300,
    swr: 1800,
  },
  { match: /^\/health$/, sMaxAge: 30, swr: 60 },
];

function pickRule(pathWithQuery: string): Rule | undefined {
  return CACHE_RULES.find((r) => r.match.test(pathWithQuery));
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const upstreamPath = url.pathname.replace(/^\/api/, "") + url.search;
  const upstreamUrl = BACKEND + (upstreamPath || "/");

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: req.method,
      headers: { accept: "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, message: "upstream fetch failed" }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const enc = upstream.headers.get("content-encoding");
  if (enc) headers.set("content-encoding", enc);

  const rule = pickRule(upstreamPath.split("?")[0]);
  if (rule && upstream.ok && req.method === "GET") {
    const cc = `public, s-maxage=${rule.sMaxAge}, stale-while-revalidate=${rule.swr}`;
    headers.set("Cache-Control", cc);
    headers.set("CDN-Cache-Control", `public, s-maxage=${rule.sMaxAge}`);
    headers.set("Vercel-CDN-Cache-Control", `public, s-maxage=${rule.sMaxAge}`);
  } else {
    headers.set("Cache-Control", "no-store");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}
