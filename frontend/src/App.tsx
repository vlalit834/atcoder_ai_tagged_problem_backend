import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Spinner } from "reactstrap";
import NavigationBar from "./components/NavigationBar";
import HomePage from "./pages/HomePage";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

// Heavy pages are split into their own bundles and only fetched on navigation.
const ListPage = lazy(() => import("./pages/ListPage"));
const TablePage = lazy(() => import("./pages/TablePage"));
const UserPage = lazy(() => import("./pages/UserPage"));

const PageFallback = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <Spinner color="primary" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <NavigationBar />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/list" element={<ListPage />} />
              <Route path="/table" element={<TablePage />} />
              <Route path="/user/:username" element={<UserPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;