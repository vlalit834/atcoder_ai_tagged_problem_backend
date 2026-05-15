import type {
  ApiResponse,
  HealthData,
  PaginatedProblems,
  TagCount,
  ContestList,
  DifficultyResponse,
  AllProblemsResponse,
} from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    return request<PaginatedProblems>(`/problems${qs ? `?${qs}` : ""}`);
  },

  tags: () => request<TagCount[]>("/tags"),

  contests: (category?: string) => {
    const qs = category ? `?category=${category}` : "";
    return request<ContestList>(`/contests${qs}`);
  },

  difficulties: () => request<DifficultyResponse>("/problems/difficulties"),

  allProblems: () => request<AllProblemsResponse>("/problems/all"),
};