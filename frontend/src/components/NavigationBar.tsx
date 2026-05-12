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
} from "reactstrap";
import { NavLink, useNavigate } from "react-router-dom";

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const navigate = useNavigate();

  const toggle = () => setIsOpen(!isOpen);

  const handleUserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      navigate(`/user/${userInput.trim()}`);
      setUserInput("");
    }
  };

  return (
    <Navbar color="dark" dark expand="md" className="px-3">
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
        </Nav>

        <Form onSubmit={handleUserSearch} className="d-flex" role="search">
          <Input
            type="text"
            placeholder="AtCoder username..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="me-2"
          />
          <Button color="primary" type="submit">
            Go
          </Button>
        </Form>
      </Collapse>
    </Navbar>
  );
};

export default NavigationBar;
