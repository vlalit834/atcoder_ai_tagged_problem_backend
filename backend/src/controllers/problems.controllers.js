import { queries } from "../db/queries.js";
import { parsePagination } from "../utils/pagination.js";
import { ok } from "../utils/apiResponse.js";

export function listProblems(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const total = queries.countAll().get().total;
  const items = queries.selectPage().all(limit, offset);
  ok(res, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    items,
  });
}
