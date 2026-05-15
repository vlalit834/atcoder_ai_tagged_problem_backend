import { queries } from "../db/queries.js";
import { parsePagination } from "../utils/pagination.js";
import { ok, fail } from "../utils/apiResponse.js";
import { isValidUsername, sanitizeTag } from "../utils/validate.js";
import {
  getContests,
  getProblems,
  getMergedProblems,
  getProblemModels,
  getUserSubmissions,
} from "../services/kenkoooo.service.js";

export async function listProblems(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const tag = sanitizeTag(req.query.tag);
  
  const search = req.query.search ? req.query.search.toLowerCase().trim() : "";
  const sort = req.query.sort || "id_asc"; 

  try {
    let filtered = queries.getAllProblems().all();

    if (tag) {
      filtered = filtered.filter(p => {
        if (!p.Tags) return false;
        const tagsArray = p.Tags.split(",").map(t => t.trim().toLowerCase());
        return tagsArray.includes(tag.toLowerCase());
      });
    }

    if (search) {
      filtered = filtered.filter(p => {
        const atcoderId = (p.Problem_Link || "").split('/').pop() || "";
        return atcoderId.toLowerCase().includes(search);
      });
    }

    const models = await getProblemModels();

    const missingSentinel =
      sort === "diff_desc" ? -Infinity : Number.POSITIVE_INFINITY;

    filtered.sort((a, b) => {
      const aId = (a.Problem_Link || "").split("/").pop() || "";
      const bId = (b.Problem_Link || "").split("/").pop() || "";

      if (sort === "diff_asc" || sort === "diff_desc") {
        const aDiff = models[aId]?.difficulty ?? missingSentinel;
        const bDiff = models[bId]?.difficulty ?? missingSentinel;

        if (aDiff !== bDiff) {
          return sort === "diff_asc" ? aDiff - bDiff : bDiff - aDiff;
        }
        return aId.localeCompare(bId);
      }

      if (sort === "id_desc") {
        return bId.localeCompare(aId);
      }
      return aId.localeCompare(bId);
    });

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    ok(res, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    fail(res, error.message, 500);
  }
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
  let filtered = contests;
  if (category) {
    filtered = contests.filter((c) => c.id.startsWith(category));
  }
  filtered.sort((a, b) => b.start_epoch_second - a.start_epoch_second);
  ok(res, { total: filtered.length, items: filtered });
}

export async function listAllProblems(req, res) {
  const [problems, merged] = await Promise.all([
    getProblems(),
    getMergedProblems(),
  ]);

  const mergedMap = new Map(merged.map((m) => [m.id, m]));

  // Build a single in-memory tag lookup keyed by AtCoder problem id (the
  // trailing slug of Problem_Link). One DB scan replaces ~9 600 LIKE queries.
  const tagsById = new Map();
  for (const row of queries.getAllProblems().all()) {
    if (!row.Problem_Link || !row.Tags) continue;
    const id = row.Problem_Link.split("/").pop();
    if (id) tagsById.set(id, row.Tags);
  }

  const result = problems.map((p) => {
    const extra = mergedMap.get(p.id) || {};
    return {
      id: p.id,
      contest_id: p.contest_id,
      problem_index: p.problem_index,
      name: p.name,
      title: p.title,
      solver_count: extra.solver_count || null,
      tags: tagsById.get(p.id) || null,
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
  if (!isValidUsername(username)) {
    return fail(res, "invalid username", 400);
  }
  const summary = await getUserSubmissions(username);
  ok(res, { username, ...summary });
}