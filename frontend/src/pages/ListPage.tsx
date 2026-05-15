import { useEffect, useState } from "react";
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
import type { Problem, PaginatedProblems, TagCount } from "../types/api";

export default function ListPage() {
  // ---------- STATE ----------
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tags, setTags] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const limit = 50;

  // ---------- FETCH TAGS (sirf 1 baar, mount par) ----------
  useEffect(() => {
    api
      .tags()
      .then((res) => {
        if (res.success && res.data) setTags(res.data);
      })
      .catch((err) => console.error("Tags fetch failed:", err));
  }, []); // empty deps = sirf mount par

  // ---------- FETCH PROBLEMS (jab bhi page ya tag badle) ----------
  useEffect(() => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number> = { page, limit };
    if (selectedTag) params.tag = selectedTag;

    api
      .problems(params)
      .then((res) => {
        if (res.success && res.data) {
          const data = res.data as PaginatedProblems;
          setProblems(data.problems);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        } else {
          setError("Failed to load problems");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page, selectedTag]); // jab bhi yeh change ho, refetch

  // ---------- HANDLERS ----------
  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTag(e.target.value);
    setPage(1); // tag badle to page 1 par reset
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // ---------- RENDER ----------
  return (
    <Container className="mt-4">
      <h2 className="mb-3">📋 Problem List</h2>

      {/* Tag Filter Dropdown — YEH HAI USP 🔥 */}
      <Row className="mb-3">
        <Col md={6}>
          <Label for="tagSelect">
            <strong>Tags:</strong>
          </Label>
          <Input
            id="tagSelect"
            type="select"
            value={selectedTag}
            onChange={handleTagChange}
          >
            <option value="">All Tags ({total} problems)</option>
            {tags.map((t) => (
              <option key={t.tag} value={t.tag}>
                {t.tag} ({t.count})
              </option>
            ))}
          </Input>
        </Col>
      </Row>

      {/* Loading / Error / Empty / Table */}
      {loading && (
        <div className="text-center my-4">
          <Spinner color="primary" /> <span className="ms-2">Loading...</span>
        </div>
      )}

      {error && <Alert color="danger">❌ {error}</Alert>}

      {!loading && !error && problems.length === 0 && (
        <Alert color="warning">No problems found for this filter.</Alert>
      )}

      {!loading && !error && problems.length > 0 && (
        <>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Problem</th>
                <th>Contest</th>
                <th>AI Tags</th>
                <th>Editorial</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p, idx) => (
                <tr key={p.Problem_Link}>
                  <td>{(page - 1) * limit + idx + 1}</td>
                  <td>
                    <a
                      href={p.Problem_Link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.Problem_Name}
                    </a>
                  </td>
                  <td>{p.Contest_Name}</td>
                  <td>
                    {p.Tags?.split(",").map((tag) => (
                      <Badge key={tag} color="info" className="me-1">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    {p.Editorial_Link ? (
                      <a
                        href={p.Editorial_Link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📖
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center my-3">
            <Button color="secondary" onClick={goPrev} disabled={page === 1}>
              ← Previous
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
              Next →
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}