import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import theme from "./styles/theme.ts";
import { ThemeProvider } from "@mui/material/styles";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Analytics />
      <App />
    </ThemeProvider>
  </StrictMode>
);
