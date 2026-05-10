import { queries } from "../db/queries.js";
import { parsePagination } from "../utils/pagination.js";
import { ok, fail } from "../utils/apiResponse.js";
import {
  getContests,
  getProblems,
  getMergedProblems,
  getProblemModels,
  getUserSubmissions,
} from "../services/kenkoooo.service.js";
export function listProblems(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const tag = req.query.tag?.trim();
  const total = queries.countAll().get().total;
  const items = queries.selectPage().all(limit, offset);
  if (tag) {
    const pattern = `%${tag}%`;
    total = queries.countByTag().get(pattern).total;
    items = queries.searchByTag().all(pattern, limit, offset);
  }
  ok(res, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  });
}

export function listTags(req, res) {
  const rows = queries.selectAllTags().all();
  const tagCount = new Map();

  for (const row of rows) {
    if (row.Tags) {
      const tags = row.Tags.split(",").map((t) => t.trim());
      for (const tag of tags) {
        if (tag) {
          tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        }
      }
    }
  }

  const result = Array.from(tagCount.entries())
    .map(([Tags, count]) => ({ Tags, count }))
    .sort((a, b) => b.count - a.count);

  ok(res, result);
}

export async function listContests(req, res) {
  const contests = await getContests();
  const category = req.query.category?.toLowerCase();
  let flitered = contests;
  if (category) {
    flitered = contests.filter((c) => c.id.startsWith(category));
  }
  flitered.sort((a, b) => b.start_epoch_second - a.start_epoch_second);
  ok(res, { total: flitered.length, items: flitered });
}

export async function listAllProblems(req, res) {
  const [problems, merged] = await Promise.all([
    getProblems(),
    getMergedProblems(),
  ]);

  const mergedMap = new Map(merged.map((m) => [m.id, m]));

  const result = problems.map((p) => {
    const extra = mergedMap.get(p.id) || {};
    const linkPattern = `%${p.id}%`;
    const dbRow = queries.findByLink().get(linkPattern);

    return {
      id: p.id,
      contest_id: p.contest_id,
      problem_index: p.problem_index,
      name: p.name,
      title: p.title,
      solver_count: extra.solver_count || null,
      tags: dbRow?.Tags || null,
    };
  });

  ok(res, { total: result.length, items: result });
}

export async function listDifficulties(req, res) {
  const models = await getProblemModels();
  ok(res, models);
}

export async function userSubmissions(req, res) {
  const { username } = req.params;
  if (!username) {
    return fail(res, "invlaid username", 400);
  }
  const submissions = await getUserSubmissions(username);
  const accepted = submissions.filter((s) => s.result === "AC");
  const solvedSet = new Set(accepted.map((s) => s.problem_index));
  ok(res, {
    username,
    total_submissions: submissions.length,
    accepted_count: accepted.length,
    unique_solved: solvedSet.size,
    solved_problems: Array.from(solvedSet),
  });
}
