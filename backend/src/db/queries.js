import { getDb } from "./connection";

const cache = new Map();
function prep(key, sql) {
  if (!cache.has(key)) {
    cache.set(key, getDb().prepare(sql));
  }
  return cache.get(key);
}

export const queries = {
  constAll: () => prep(`countAll`, `SELECT COUNT(*) AS total FROM problems`),
  selectPage: () =>
    prep(
      `selectPage`,
      `SELECT problem_index,Problem_Link,Editorial_Link,Tags FROM problems ORDER BY id ASC LIMIT ? OFFESET`,
    ),
  tagCounts: () =>
    prep(
      `tagCounts`,
      `SELECT Tags,COUNT(*) AS count FROM problems GROUP BY tag ORDER BY count DESC`,
    ),
  distinctContest: () =>
    prep(
      `distinctContest`,
      `SELECT DISTINCT substr(id,1,instr(id,'_)-1) AS contest FROM problems WHERE problems WHERE instr(id,'_)>0 OREDER BY contest ASC`,
    ),
};
