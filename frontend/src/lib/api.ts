import type {
  ApiResponse,
  HealthData,
  PaginatedProblems,
  TagCount,
  ContestList,
  DifficultyResponse,
  AllProblemsResponse,
  UserSubmissionsResponse,
} from "../types/api";
import { cachedFetch } from "./cache";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ONE_HOUR = 60 * 60 * 1000;
const FIVE_MIN = 5 * 60 * 1000;

async function request<T>(path: string): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error("API returned success: false");
  }

  return data.message;
}

export interface ProblemsParams {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
  sort?: string;
}

export const api = {
  health: () => request<HealthData>("/health"),

  problems: (params?: ProblemsParams) => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.tag) query.set("tag", params.tag);
    if (params?.search) query.set("search", params.search);
    if (params?.sort) query.set("sort", params.sort);
    const qs = query.toString();
    const path = `/problems${qs ? `?${qs}` : ""}`;
    return cachedFetch(path, () => request<PaginatedProblems>(path), {
      ttl: FIVE_MIN,
      persist: false,
    });
  },

  tags: () =>
    cachedFetch("/tags", () => request<TagCount[]>("/tags"), {
      ttl: ONE_HOUR,
    }),

  contests: (category?: string) => {
    const path = `/contests${category ? `?category=${category}` : ""}`;
    return cachedFetch(path, () => request<ContestList>(path), {
      ttl: ONE_HOUR,
    });
  },

  difficulties: () =>
    cachedFetch(
      "/problems/difficulties",
      () => request<DifficultyResponse>("/problems/difficulties"),
      { ttl: ONE_HOUR },
    ),

  allProblems: () =>
    cachedFetch(
      "/problems/all",
      () => request<AllProblemsResponse>("/problems/all"),
      { ttl: ONE_HOUR },
    ),

  userSubmissions: (username: string) => {
    const path = `/problems/user/${encodeURIComponent(username)}/submissions`;
    return cachedFetch(
      path,
      () => request<UserSubmissionsResponse>(path),
      { ttl: FIVE_MIN, persist: true },
    );
  },
};