import { Container, Alert, Button } from "reactstrap";

function App() {
  return (
    <Container className="my-5">
      <Alert color="success">
        Bootstrap is working!
      </Alert>
      <h1>AtCoder Tagged Problems</h1>
      <p>Frontend setup successful! </p>
      <Button color="primary">Click me</Button>
    </Container>
  );
}

export default App;