import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.jsx";
import AuthProvider from "./contexts/AuthProvider";
import PlayerProvider from "./contexts/PlayerProvider";
import "./index.css";
import "./styles/app-layout.css";
import "./styles/admin-layout.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);