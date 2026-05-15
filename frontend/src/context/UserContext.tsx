import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../lib/api";
import type { UserSubmissionsResponse } from "../types/api";

interface UserContextValue {
  username: string;
  data: UserSubmissionsResponse | null;
  solvedSet: Set<string>;
  loading: boolean;
  error: string | null;
  setUsername: (name: string) => void;
  clearUser: () => void;
  refresh: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = "atcoder-username";

function readStoredUsername(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string>(readStoredUsername);
  const [data, setData] = useState<UserSubmissionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    if (!username) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .userSubmissions(username)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load user submissions");
        setData(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username, refreshKey]);

  const setUsername = useCallback((name: string) => {
    const trimmed = name.trim();
    setUsernameState(trimmed);
    try {
      if (trimmed) window.localStorage.setItem(STORAGE_KEY, trimmed);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const clearUser = useCallback(() => {
    setUsername("");
  }, [setUsername]);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const solvedSet = useMemo(() => {
    return new Set(data?.solved_problems || []);
  }, [data]);

  const value = useMemo<UserContextValue>(
    () => ({
      username,
      data,
      solvedSet,
      loading,
      error,
      setUsername,
      clearUser,
      refresh,
    }),
    [
      username,
      data,
      solvedSet,
      loading,
      error,
      setUsername,
      clearUser,
      refresh,
    ],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
