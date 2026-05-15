export interface ApiResponse<T> {
  success: boolean;
  message: T;
}

export interface HealthData {
  server: string;
  uptime_seconds: number;
  memory_mb: number;
  timestamp: string;
  database: string;
  problem_count: number;
}

export interface Problem {
  problem_index: number;
  Problem_Link: string;
  Editorial_Link: string;
  Tags: string;
}

export interface PaginatedProblems {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  items: Problem[];
}

export interface TagCount {
  Tags: string;
  count: number;
}

export interface Contest {
  id: string;
  start_epoch_second: number;
  duration_second: number;
  title: string;
  rate_change: string;
}

export interface ContestList {
  total: number;
  items: Contest[];
}

export interface ProblemModel {
  difficulty?: number;
  is_experimental?: boolean;
}

export type DifficultyResponse = Record<string, ProblemModel>;

export interface AllProblem {
  id: string;
  contest_id: string;
  problem_index: string;
  name: string;
  title: string;
  solver_count: number | null;
  tags: string | null;
}

export interface AllProblemsResponse {
  total: number;
  items: AllProblem[];
}

export interface UserSubmissionsResponse {
  username: string;
  total_submissions: number;
  accepted_count: number;
  unique_solved: number;
  solved_problems: string[];
}
