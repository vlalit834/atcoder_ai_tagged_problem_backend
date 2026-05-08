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

export async function getUserSubmissions(user, fromSecond = 0) {
  const url = `${BASE}/atcoder-api/v3/user/submissions?user=${encodeURIComponent(user)}&from_second=${fromSecond}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kenkoooo error: ${response.status} for ${user}`);
  }
  return response.json();
}
