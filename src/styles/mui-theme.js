import { createTheme } from "@material-ui/core/styles";

/**
 * Modern color system with light/dark mode support
 */
const sharedPalette = {
  primary: {
    main: "#2E7D52",
    light: "#4CAF73",
    dark: "#1B5E3A",
    contrastText: "#FFFFFF"
  },
  secondary: {
    main: "#5C6BC0",
    light: "#7986CB",
    dark: "#3F51B5"
  },
  error: {
    main: "#E53935",
    light: "#EF5350",
    dark: "#C62828"
  },
  warning: {
    main: "#F9A825",
    light: "#FDD835",
    dark: "#F57F17"
  },
  info: {
    main: "#1E88E5",
    light: "#42A5F5",
    dark: "#1565C0"
  },
  success: {
    main: "#2E7D52",
    light: "#4CAF73",
    dark: "#1B5E3A"
  }
};

const lightTheme = {
  palette: {
    type: "light",
    ...sharedPalette,
    background: {
      default: "#F7F8FA",
      paper: "#FFFFFF"
    },
    text: {
      primary: "#1A1A2E",
      secondary: "#6B7280"
    },
    divider: "#E5E7EB",
    grey: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827"
    }
  },
  typography: {
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h6: {
      fontWeight: 600,
      fontSize: "1.1rem",
      lineHeight: 1.3
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "0.95rem"
    },
    subtitle2: {
      fontWeight: 400,
      fontSize: "0.85rem",
      color: "#6B7280"
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.5
    },
    body2: {
      fontSize: "0.85rem",
      lineHeight: 1.4
    },
    button: {
      fontWeight: 500,
      textTransform: "none"
    }
  },
  shape: {
    borderRadius: 8
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 8,
        padding: "8px 16px",
        fontWeight: 500,
        textTransform: "none"
      },
      outlined: {
        borderColor: "#E5E7EB"
      },
      contained: {
        boxShadow: "none",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
        }
      }
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
      }
    },
    MuiBadge: {
      badge: {
        fontWeight: 600,
        fontSize: "0.75rem"
      }
    },
    MuiToolbar: {
      root: {
        minHeight: "52px !important"
      }
    }
  }
};

const darkTheme = {
  palette: {
    type: "dark",
    ...sharedPalette,
    primary: {
      ...sharedPalette.primary,
      main: "#4CAF73"
    },
    background: {
      default: "#111827",
      paper: "#1F2937"
    },
    text: {
      primary: "#F3F4F6",
      secondary: "#9CA3AF"
    },
    divider: "#374151",
    grey: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827"
    }
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  overrides: {
    ...lightTheme.overrides,
    MuiButton: {
      ...lightTheme.overrides.MuiButton,
      outlined: {
        borderColor: "#374151"
      }
    },
    MuiCard: {
      root: {
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)"
      }
    }
  }
};

const defaultTheme = lightTheme;

let theme = createTheme(defaultTheme);

export { defaultTheme, lightTheme, darkTheme };

export default theme;
