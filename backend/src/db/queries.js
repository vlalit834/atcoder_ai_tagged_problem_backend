import { getDb } from "./connection.js";

const cache = new Map();
function prep(key, sql) {
  if (!cache.has(key)) {
    cache.set(key, getDb().prepare(sql));
  }
  return cache.get(key);
}

export const queries = {
  getAllProblems: () =>
    prep(
      "getAllProblems",
      `SELECT problem_index, Problem_Link, Editorial_Link, Tags FROM problems`,
    ),
  countAll: () => prep("countAll", `SELECT COUNT(*) AS total FROM problems`),

  selectPage: () =>
    prep(
      "selectPage",
      `SELECT problem_index, Problem_Link, Editorial_Link, Tags
       FROM problems ORDER BY problem_index ASC LIMIT ? OFFSET ?`,
    ),

  selectAllTags: () => prep("selectAllTags", `SELECT Tags FROM problems`),

  searchByTag: () =>
    prep(
      "searchByTag",
      `SELECT problem_index, Problem_Link, Editorial_Link, Tags
       FROM problems WHERE Tags LIKE ? ORDER BY problem_index ASC LIMIT ? OFFSET ?`,
    ),

  countByTag: () =>
    prep(
      "countByTag",
      `SELECT COUNT(*) AS total FROM problems WHERE Tags LIKE ?`,
    ),

  findByLink: () =>
    prep("findByLink", `SELECT Tags FROM problems WHERE Problem_Link LIKE ?`),
};
