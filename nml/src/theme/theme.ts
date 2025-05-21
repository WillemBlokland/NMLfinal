import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    primary: { main: "#e3000b" }, // Red Impact
    secondary: { main: "#ff424b" }, // Poppy
    error: { main: "#be311e" }, // Lady Bug
    warning: { main: "#8f2011" }, // Berry
    info: { main: "#730e04" }, // Maroon
    success: { main: "#4a0004" }, // Mahogany
    background: { default: "#fff5f5", paper: "#ffecec" },
    text: { primary: "#330000", secondary: "#730e04" },
  },
  typography: {
    fontFamily: "Open Sans, sans-serif",
    h1: {
      fontSize: "48pt",
      fontWeight: 800, // Open Sans ExtraBold
      letterSpacing: "-0.03em",
      lineHeight: 1.0,
    },
    h2: {
      fontSize: "24pt",
      fontWeight: 800, // Open Sans ExtraBold
      letterSpacing: "-0.03em",
      lineHeight: 1.0,
    },
    subtitle1: {
      fontSize: "12pt",
      fontWeight: 300, // Open Sans Light
      letterSpacing: "-0.01em",
      lineHeight: 1.25,
    },
    body1: {
      fontSize: "12pt",
      fontWeight: 400, // Open Sans Regular
      letterSpacing: "-0.01em",
      lineHeight: 1.25,
    },
    body2: {
      fontSize: "9pt",
      fontWeight: 400, // Open Sans Regular
      letterSpacing: "-0.01em",
      lineHeight: 1.33,
    },
    caption: {
      fontSize: "8pt",
      fontWeight: 400, // Open Sans Regular (for print)
      letterSpacing: "-0.01em",
      lineHeight: 1.33,
    },
  },
});

export default theme;
