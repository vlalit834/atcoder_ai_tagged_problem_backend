import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Spinner,
  Alert,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Progress,
  Badge,
} from "reactstrap";
import { api } from "../lib/api";
import { useUser } from "../context/UserContext";
import { getDifficultyInfo } from "../lib/difficulty";
import type { DifficultyResponse, AllProblem } from "../types/api";
import { useState } from "react";

const DIFFICULTY_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "0 - 399 (Gray)", min: 0, max: 399 },
  { label: "400 - 799 (Brown)", min: 400, max: 799 },
  { label: "800 - 1199 (Green)", min: 800, max: 1199 },
  { label: "1200 - 1599 (Cyan)", min: 1200, max: 1599 },
  { label: "1600 - 1999 (Blue)", min: 1600, max: 1999 },
  { label: "2000 - 2399 (Yellow)", min: 2000, max: 2399 },
  { label: "2400 - 2799 (Orange)", min: 2400, max: 2799 },
  { label: "2800+ (Red)", min: 2800, max: Infinity },
];

export default function UserPage() {
  const { username: routeUsername } = useParams<{ username: string }>();
  const {
    username: ctxUsername,
    data,
    solvedSet,
    loading,
    error,
    setUsername,
    refresh,
  } = useUser();

  const [difficulties, setDifficulties] = useState<DifficultyResponse>({});
  const [allProblems, setAllProblems] = useState<AllProblem[]>([]);
  const [metaLoading, setMetaLoading] = useState<boolean>(true);

  useEffect(() => {
    if (routeUsername && routeUsername !== ctxUsername) {
      setUsername(routeUsername);
    }
  }, [routeUsername, ctxUsername, setUsername]);

  useEffect(() => {
    setMetaLoading(true);
    Promise.all([api.difficulties(), api.allProblems()])
      .then(([diff, probs]) => {
        setDifficulties(diff || {});
        setAllProblems(probs.items || []);
      })
      .catch(() => {
        // ignore - sub-page still works without these
      })
      .finally(() => setMetaLoading(false));
  }, []);

  const problemsById = useMemo(() => {
    const m = new Map<string, AllProblem>();
    for (const p of allProblems) m.set(p.id, p);
    return m;
  }, [allProblems]);

  const bucketStats = useMemo(() => {
    return DIFFICULTY_BUCKETS.map((bucket) => {
      let total = 0;
      let solved = 0;
      for (const [pid, model] of Object.entries(difficulties)) {
        const d = model?.difficulty;
        if (d == null) continue;
        if (d >= bucket.min && d <= bucket.max) {
          total++;
          if (solvedSet.has(pid)) solved++;
        }
      }
      return { ...bucket, total, solved };
    });
  }, [difficulties, solvedSet]);

  const tagStats = useMemo(() => {
    const counter = new Map<string, number>();
    for (const pid of solvedSet) {
      const p = problemsById.get(pid);
      if (!p?.tags) continue;
      for (const t of p.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)) {
        counter.set(t, (counter.get(t) || 0) + 1);
      }
    }
    return Array.from(counter.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
  }, [solvedSet, problemsById]);

  const recentSolved = useMemo(() => {
    return Array.from(solvedSet)
      .map((pid) => problemsById.get(pid))
      .filter((p): p is AllProblem => Boolean(p))
      .sort((a, b) => b.contest_id.localeCompare(a.contest_id))
      .slice(0, 20);
  }, [solvedSet, problemsById]);

  const username = routeUsername || ctxUsername;

  if (!username) {
    return (
      <Container className="mt-5">
        <Alert color="info">
          <h5>No user selected</h5>
          <p className="mb-0">
            Enter your AtCoder username in the navbar to see your stats.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4 mb-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-1">
            @{username}{" "}
            {loading && <Spinner size="sm" color="primary" className="ms-2" />}
          </h2>
          <div className="d-flex gap-2">
            <a
              href={`https://atcoder.jp/users/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none"
            >
              <Badge color="primary">View on AtCoder</Badge>
            </a>
          </div>
        </Col>
        <Col xs="auto">
          <Button color="secondary" outline size="sm" onClick={refresh}>
            Refresh
          </Button>
        </Col>
      </Row>

      {error && <Alert color="danger">{error}</Alert>}

      {data && (
        <Row className="mb-4 g-3">
          <Col md={4}>
            <Card>
              <CardBody>
                <CardTitle tag="h6" className="text-muted">
                  Unique Solved
                </CardTitle>
                <h3 className="mb-0 text-success">{data.unique_solved}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <CardBody>
                <CardTitle tag="h6" className="text-muted">
                  Accepted Submissions
                </CardTitle>
                <h3 className="mb-0">{data.accepted_count}</h3>
              </CardBody>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <CardBody>
                <CardTitle tag="h6" className="text-muted">
                  Total Submissions
                </CardTitle>
                <h3 className="mb-0">{data.total_submissions}</h3>
                <small className="text-muted">
                  AC rate:{" "}
                  {data.total_submissions > 0
                    ? (
                        (data.accepted_count / data.total_submissions) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </small>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {!metaLoading && (
        <Row className="g-4">
          <Col lg={7}>
            <Card>
              <CardBody>
                <CardTitle tag="h5">Progress by Difficulty</CardTitle>
                <Table size="sm" borderless className="mb-0">
                  <tbody>
                    {bucketStats.map((b) => {
                      const pct = b.total > 0 ? (b.solved / b.total) * 100 : 0;
                      return (
                        <tr key={b.label}>
                          <td style={{ width: "30%" }}>
                            <small>{b.label}</small>
                          </td>
                          <td>
                            <Progress
                              value={pct}
                              color="success"
                              style={{ height: 18 }}
                            >
                              {b.solved} / {b.total}
                            </Progress>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          <Col lg={5}>
            <Card>
              <CardBody>
                <CardTitle tag="h5">Top Solved Tags</CardTitle>
                {tagStats.length === 0 ? (
                  <p className="text-muted small mb-0">
                    No tagged problems solved yet.
                  </p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {tagStats.map(([tag, count]) => (
                      <Badge
                        key={tag}
                        color="info"
                        pill
                        style={{ fontSize: "0.85em" }}
                      >
                        {tag} <span className="ms-1 fw-bold">{count}</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          <Col xs={12}>
            <Card>
              <CardBody>
                <CardTitle tag="h5">Recently Solved</CardTitle>
                {recentSolved.length === 0 ? (
                  <p className="text-muted small mb-0">
                    No solved problems found in our dataset.
                  </p>
                ) : (
                  <Table size="sm" hover responsive>
                    <thead>
                      <tr>
                        <th>Problem</th>
                        <th>Contest</th>
                        <th>Difficulty</th>
                        <th>Tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSolved.map((p) => {
                        const diff = difficulties[p.id]?.difficulty ?? null;
                        const info = getDifficultyInfo(diff);
                        const tags = (p.tags || "")
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean);
                        return (
                          <tr key={p.id}>
                            <td>
                              <a
                                href={`https://atcoder.jp/contests/${p.contest_id}/tasks/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {p.problem_index}. {p.name}
                              </a>
                            </td>
                            <td>
                              <small>{p.contest_id.toUpperCase()}</small>
                            </td>
                            <td style={{ color: info.color, fontWeight: 600 }}>
                              {diff != null ? Math.round(diff) : "-"}
                            </td>
                            <td>
                              {tags.slice(0, 3).map((t) => (
                                <Badge
                                  key={t}
                                  color="light"
                                  className="text-dark border me-1"
                                  style={{ fontSize: "0.7em" }}
                                >
                                  {t}
                                </Badge>
                              ))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
                <div className="mt-2 d-flex gap-2">
                  <Link to="/list">
                    <Button color="primary" outline size="sm">
                      Browse List (AC highlighted)
                    </Button>
                  </Link>
                  <Link to="/table">
                    <Button color="primary" outline size="sm">
                      Browse Table (AC highlighted)
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {metaLoading && (
        <div className="text-center my-5">
          <Spinner color="primary" />
          <span className="ms-2">Loading problem data...</span>
        </div>
      )}
    </Container>
  );
}
