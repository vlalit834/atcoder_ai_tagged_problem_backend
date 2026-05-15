import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarToggler,
  Collapse,
  Nav,
  NavItem,
  Input,
  Button,
  Form,
  Badge,
} from "reactstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { username, setUsername, clearUser, loading } = useUser();

  const toggle = () => setIsOpen(!isOpen);

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const name = userInput.trim();
    if (!name) return;
    setUsername(name);
    navigate(`/user/${name}`);
    setUserInput("");
  };

  const handleClearUser = () => {
    clearUser();
  };

  const isDark = theme === "dark";

  return (
    <Navbar
      color={isDark ? "dark" : "light"}
      dark={isDark}
      light={!isDark}
      expand="md"
      className="px-3"
    >
      <NavbarBrand tag={NavLink} to="/">
        AtCoder AI Tags
      </NavbarBrand>

      <NavbarToggler onClick={toggle} />

      <Collapse isOpen={isOpen} navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <NavLink to="/list" className="nav-link">
              List
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/table" className="nav-link">
              Table
            </NavLink>
          </NavItem>
          {username && (
            <NavItem>
              <NavLink to={`/user/${username}`} className="nav-link">
                Profile
              </NavLink>
            </NavItem>
          )}
        </Nav>

        {username ? (
          <div className="d-flex align-items-center me-2 gap-2">
            <Badge color="success" pill>
              {loading ? "Loading..." : `@${username}`}
            </Badge>
            <Button
              color="secondary"
              outline
              size="sm"
              onClick={handleClearUser}
              title="Sign out"
            >
              Clear
            </Button>
          </div>
        ) : (
          <Form
            onSubmit={handleUserSearch}
            className="d-flex me-2"
            role="search"
          >
            <Input
              type="text"
              placeholder="AtCoder username..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="me-2"
              bsSize="sm"
            />
            <Button color="primary" size="sm" type="submit">
              Go
            </Button>
          </Form>
        )}

        <Button
          color={isDark ? "light" : "dark"}
          outline
          size="sm"
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? "Light" : "Dark"}
        </Button>
      </Collapse>
    </Navbar>
  );
};

export default NavigationBar;