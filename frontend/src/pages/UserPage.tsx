import { Container } from "reactstrap";
import { useParams } from "react-router-dom";

const UserPage = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <Container className="mt-4">
      <h2>User: {username}</h2>
      <p>User solved problems, stats </p>
    </Container>
  );
};

export default UserPage;
