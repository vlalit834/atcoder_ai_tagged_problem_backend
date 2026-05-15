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
const MAX_BATCHES = 400; // safety cap: 400 * 500 = 200,000 submissions max

/**
 * Fetches user submissions from Kenkoooo and stream-processes them into
 * a compact shape (solved problem IDs + counts) without retaining the raw
 * submission objects. Memory stays bounded regardless of submission volume,
 * which is essential on low-RAM hosts.
 */
export async function getUserSubmissions(user) {
  const now = Date.now();
  const cached = userSubsCache.get(user);
  if (cached && now - cached.fetchedAt < USER_TTL) {
    return cached.data;
  }

  const solvedSet = new Set();
  let totalSubmissions = 0;
  let acceptedCount = 0;
  let fromSecond = 0;
  let batches = 0;

  while (batches < MAX_BATCHES) {
    const url = `${BASE}/atcoder-api/v3/user/submissions?user=${encodeURIComponent(user)}&from_second=${fromSecond}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Kenkoooo error: ${response.status} for ${user}`);
    }
    const batch = await response.json();
    if (batch.length === 0) break;

    totalSubmissions += batch.length;
    for (const s of batch) {
      if (s.result === "AC") {
        acceptedCount++;
        solvedSet.add(s.problem_id);
      }
    }

    if (batch.length < 500) break;
    fromSecond = batch[batch.length - 1].epoch_second + 1;
    batches++;
    // Yield to the event loop so other requests are not starved on slow paginations
    await new Promise((resolve) => setImmediate(resolve));
  }

  const data = {
    total_submissions: totalSubmissions,
    accepted_count: acceptedCount,
    unique_solved: solvedSet.size,
    solved_problems: Array.from(solvedSet),
  };
  userSubsCache.set(user, { data, fetchedAt: now });
  return data;
}