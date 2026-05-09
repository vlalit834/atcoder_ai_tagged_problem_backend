import { queries } from "../db/queries.js";
import { parsePagination } from "../utils/pagination.js";
import { ok } from "../utils/apiResponse.js";
import { getContests } from "../services/kenkoooo.service.js";
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
