import { createTheme } from "@mui/material/styles";

/**
 * Default application theme.
 *
 * Organizations can override `palette` at runtime (see App.jsx / themeEditor).
 * All other tokens (typography, spacing, breakpoints, components) are stable
 * defaults applied globally.
 */
const defaultTheme = {
  palette: {
    mode: "light",
    primary: {
      main: "#209556"
    },
    secondary: {
      main: "#555555"
    },
    warning: {
      main: "#fabe28"
    },
    info: {
      main: "#3f80b2"
    }
  },
  typography: {
    fontFamily: ["Poppins", "Roboto", "Arial", "sans-serif"].join(","),
    // Fluid type scale — slightly smaller on mobile
    h5: { fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)" },
    body1: { fontSize: "clamp(0.875rem, 1.5vw, 1rem)" },
    body2: { fontSize: "clamp(0.75rem, 1.3vw, 0.875rem)" }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 420, // matches existing 420px Aphrodite breakpoint
      md: 768,
      lg: 1024,
      xl: 1280
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Ensure 44 px minimum touch target per WCAG 2.5.5
          minHeight: 44,
          textTransform: "none"
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: { minWidth: 44, minHeight: 44 }
      }
    }
  }
};

let theme = createTheme(defaultTheme);

export { defaultTheme };

export default theme;
