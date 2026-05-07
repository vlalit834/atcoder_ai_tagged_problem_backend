import "dotenv/config.js";

function read(name, { fallback, parse = (v) => v } = {}) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  return parse(raw);
}

const toInt = (v) => Number.parseInt(v, 10);
const toList = (v) =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const env = Object.freeze({
  NODE_ENV: read("NODE_ENV", { fallback: "development" }),
  PORT: read("PORT", { fallback: 8000, parse: toInt }),
  ALLOWED_ORIGINS: read("ALLOWED_ORIGINS", {
    fallback: ["*"],
    parse: toList,
  }),
});

export const isProd = env.NODE_ENV == "production";
