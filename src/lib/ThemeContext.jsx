import { createContext, useContext, useEffect } from "react";

// App is permanently dark-themed — light mode is not supported
// as all components use hardcoded dark colour values
const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  useEffect(() => {
    // Always enforce dark theme
    document.documentElement.classList.remove("light-theme");
    document.documentElement.classList.add("dark-theme");
    document.body.style.backgroundColor = "hsl(0 0% 6%)";
    document.body.style.color = "hsl(0 0% 95%)";
    localStorage.setItem("erp-theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);