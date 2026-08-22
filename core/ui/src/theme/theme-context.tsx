import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type FC,
    type ReactNode,
} from "react";

export type UiTheme = "glass" | "neumorphism" | "material" | "cupertino" | "cyberpunk";

const STORAGE_KEY = "uiTheme";

export type ThemeContextValue = {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const VALID_THEMES: UiTheme[] = ["glass", "neumorphism", "material", "cupertino", "cyberpunk"];

const readStoredTheme = (): UiTheme => {
  if (typeof window === "undefined") return "material";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return VALID_THEMES.includes(stored as UiTheme)
    ? (stored as UiTheme)
    : "material";
};

export const ThemeProvider: FC<{
  children: ReactNode;
  defaultTheme?: UiTheme;
}> = ({ children, defaultTheme }) => {
  const [theme, setThemeState] = useState<UiTheme>(
    () => defaultTheme ?? readStoredTheme(),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next: UiTheme) => {
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback so components can be used outside a provider (defaults to material).
    return { theme: "material", setTheme: () => {} };
  }
  return ctx;
};
