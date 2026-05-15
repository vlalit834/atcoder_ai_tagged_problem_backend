import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Input,
  Label,
  Row,
  Col,
  Button,
  Badge,
} from "reactstrap";
import { api } from "../lib/api";
import type { Problem, TagCount, DifficultyResponse } from "../types/api";
import { useDebounce } from "../hooks/useDebounce";
import { getDifficultyColor, getDifficultyLabel } from "../lib/difficulty";
import { useUser } from "../context/UserContext";

type SortKey = "id_asc" | "id_desc" | "diff_asc" | "diff_desc";

export default function ListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { solvedSet, username } = useUser();

  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialTag = searchParams.get("tag") || "";
  const initialSearch = searchParams.get("q") || "";
  const initialSort = (searchParams.get("sort") as SortKey) || "id_asc";

  const [problems, setProblems] = useState<Problem[]>([]);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [difficulties, setDifficulties] = useState<Map<string, number>>(
    new Map(),
  );

  const [selectedTag, setSelectedTag] = useState<string>(initialTag);
  const [page, setPage] = useState<number>(initialPage);
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 300);
  const limit = 50;

  useEffect(() => {
    api
      .tags()
      .then((res) => setTags(res || []))
      .catch((err) => console.error(err));

    api
      .difficulties()
      .then((res: DifficultyResponse) => {
        const map = new Map<string, number>();
        if (res) {
          Object.entries(res).forEach(([problemId, model]) => {
            if (model && model.difficulty !== undefined) {
              map.set(problemId, model.difficulty);
            }
          });
        }
        setDifficulties(map);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = {
      page,
      limit,
      search: debouncedSearch.trim().toLowerCase(),
      sort: sortKey,
    };
    if (selectedTag) params.tag = selectedTag;

    api
      .problems(params)
      .then((res) => {
        setProblems(res.items || []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, selectedTag, debouncedSearch, sortKey]);

  useEffect(() => {
    const next: Record<string, string> = {};
    if (page > 1) next.page = String(page);
    if (selectedTag) next.tag = selectedTag;
    if (debouncedSearch) next.q = debouncedSearch;
    if (sortKey !== "id_asc") next.sort = sortKey;
    setSearchParams(next, { replace: true });
  }, [page, selectedTag, debouncedSearch, sortKey, setSearchParams]);

  const getProblemId = (link: string): string => {
    return link.split("/").pop() || "";
  };

  const visibleProblems = useMemo(() => {
    return problems.map((p) => ({
      problem: p,
      diff: difficulties.get(getProblemId(p.Problem_Link)) ?? null,
    }));
  }, [problems, difficulties]);

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTag(e.target.value);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSortKey(e.target.value as SortKey);
    setPage(1);
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Container className="mt-4">
      <h2 className="mb-3">Problem List</h2>

      <Row className="mb-3 g-3">
        <Col md={4}>
          <Label for="tagSelect">
            <strong>Filter by AI Tag:</strong>
          </Label>
          <Input
            id="tagSelect"
            type="select"
            value={selectedTag}
            onChange={handleTagChange}
          >
            <option value="">All Tags ({total} problems)</option>
            {tags.map((t) => (
              <option key={t.Tags} value={t.Tags}>
                {t.Tags} ({t.count})
              </option>
            ))}
          </Input>
        </Col>

        <Col md={4}>
          <Label for="searchInput">
            <strong>Search Problem ID:</strong>
          </Label>
          <Input
            id="searchInput"
            type="text"
            placeholder="e.g. abc300_a"
            value={searchInput}
            onChange={handleSearchChange}
          />
        </Col>

        <Col md={4}>
          <Label for="sortSelect">
            <strong>Sort by:</strong>
          </Label>
          <Input
            id="sortSelect"
            type="select"
            value={sortKey}
            onChange={handleSortChange}
          >
            <option value="id_asc">Default (ID A to Z)</option>
            <option value="id_desc">ID (Z to A)</option>
            <option value="diff_asc">Difficulty (Easy to Hard)</option>
            <option value="diff_desc">Difficulty (Hard to Easy)</option>
          </Input>
        </Col>
      </Row>

      {loading && (
        <div className="text-center my-4">
          <Spinner color="primary" /> <span className="ms-2">Loading...</span>
        </div>
      )}

      {error && <Alert color="danger">{error}</Alert>}

      {!loading && !error && visibleProblems.length === 0 && (
        <Alert color="warning">No problems found for current filters.</Alert>
      )}

      {!loading && !error && visibleProblems.length > 0 && (
        <>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Problem ID</th>
                <th>Problem Link</th>
                <th>Difficulty</th>
                <th>AI Tags</th>
                <th>Editorial</th>
              </tr>
            </thead>
            <tbody>
              {visibleProblems.map(({ problem: p, diff }, idx) => {
                const pid = getProblemId(p.Problem_Link);
                const isSolved = solvedSet.has(pid);
                return (
                <tr
                  key={p.Problem_Link}
                  className={isSolved ? "table-success" : undefined}
                  title={isSolved ? `Solved by ${username}` : undefined}
                >
                  <td>{(page - 1) * limit + idx + 1}</td>
                  <td>{p.problem_index}</td>
                  <td>
                    <a
                      href={p.Problem_Link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {pid || "View Problem"}
                    </a>
                    {isSolved && (
                      <Badge color="success" className="ms-2">
                        AC
                      </Badge>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        color: getDifficultyColor(diff),
                        fontWeight: 600,
                      }}
                    >
                      {getDifficultyLabel(diff)}
                    </span>
                  </td>
                  <td>
                    {p.Tags ? (
                      p.Tags.split(",").map((tag) => (
                        <Badge key={tag} color="info" className="me-1">
                          {tag.trim()}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    {p.Editorial_Link ? (
                      <a
                        href={p.Editorial_Link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center my-3">
            <Button color="secondary" onClick={goPrev} disabled={page === 1}>
              Previous
            </Button>
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>{" "}
              <small className="text-muted">({total} total)</small>
            </span>
            <Button
              color="secondary"
              onClick={goNext}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}