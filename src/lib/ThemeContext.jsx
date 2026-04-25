import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("erp-theme") || "dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
      document.body.style.backgroundColor = "hsl(0 0% 97%)";
      document.body.style.color = "hsl(0 0% 10%)";
    } else {
      root.classList.remove("light-theme");
      root.classList.add("dark-theme");
      document.body.style.backgroundColor = "hsl(0 0% 6%)";
      document.body.style.color = "hsl(0 0% 95%)";
    }
    localStorage.setItem("erp-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);