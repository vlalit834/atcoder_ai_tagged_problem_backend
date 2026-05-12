import { Container, Alert } from "reactstrap";

const HomePage = () => {
  return (
    <Container className="mt-4">
      <h1>AtCoder AI Tagged Problems</h1>
      <Alert color="info">
        Welcome! AI-tagged AtCoder problems 
      </Alert>
      <p>
        <b>List Page</b> -problems with AI tags filter
        <br />
        <b>Table Page</b> - kenkoooo-style grid view
        <br />
        <b>User Page</b> - progress 
      </p>
    </Container>
  );
};

export default HomePage;
