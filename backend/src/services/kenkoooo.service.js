const BASE = "https://kenkoooo.com/atcoder";

const cache = {
  contests: { data: null, fetchedAt: 0 },
  problems: { data: null, fetchedAt: 0 },
  merged: { data: null, fetchedAt: 0 },
  models: { data: null, fetchedAt: 0 },
};

const TTL = 60 * 60 * 1000;

async function fetchWithCache(key, url) {
  const now = Date.now();
  if (cache[key].data && now - cache[key].fetchedAt < TTL) {
    return cache[key].data;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kenkoooo API error: ${response.status}`);
  }
  const data = await response.json();
  cache[key].data = data;
  cache[key].fetchedAt = now;
  return data;
}

export async function getContests() {
  return fetchWithCache("contests", `${BASE}/resources/contests.json`);
}

export async function getProblems() {
  return fetchWithCache("problems", `${BASE}/resources/problems.json`);
}

export async function getMergedProblems() {
  return fetchWithCache("merged", `${BASE}/resources/merged-problems.json`);
}

export async function getProblemModels() {
  return fetchWithCache("models", `${BASE}/resources/problem-models.json`);
}

const userSubsCache = new Map();
const USER_TTL = 5 * 60 * 1000;

export async function getUserSubmissions(user) {
  const now = Date.now();
  const cached = userSubsCache.get(user);

  if (cached && now - cached.fetchedAt < USER_TTL) {
    return cached.data;
  }

  const all = [];
  let fromSecond = 0;

  while (true) {
    const url = `${BASE}/atcoder-api/v3/user/submissions?user=${encodeURIComponent(user)}&from_second=${fromSecond}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Kenkoooo error: ${response.status} for ${user}`);
    }

    const batch = await response.json();

    if (batch.length === 0) break;

    all.push(...batch);

    if (batch.length < 500) break;

    const lastEpoch = batch[batch.length - 1].epoch_second;
    fromSecond = lastEpoch + 1;
  }

  userSubsCache.set(user, { data: all, fetchedAt: now });
  return all;
}