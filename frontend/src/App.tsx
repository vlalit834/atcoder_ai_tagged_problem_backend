import { useState, useEffect } from "react";
import { Container, Alert, Spinner } from "reactstrap";
import { api } from "./lib/api";
import type { HealthData } from "./types/api";

function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.health()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Container className="my-5">
      <h1>AtCoder Tagged Problems</h1>

      {loading && (
        <div className="text-center my-4">
          <Spinner color="primary" /> Loading...
        </div>
      )}

      {error && (
        <Alert color="danger">
          Error: {error}
        </Alert>
      )}

      {health && (
        <Alert color="success">
          Backend connected!<br />
          Database: <strong>{health.database}</strong><br />
          Problems: <strong>{health.problem_count.toLocaleString()}</strong><br />
          Uptime: <strong>{health.uptime_seconds}s</strong>
        </Alert>
      )}
    </Container>
  );
}

export default App;