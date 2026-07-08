import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App.jsx";
import AuthProvider from "./contexts/AuthProvider";
import FavoriteProvider from "./contexts/FavoriteProvider";
import PlayerProvider from "./contexts/PlayerProvider";
import ToastProvider from "./contexts/ToastProvider";
import "./index.css";
import "./styles/app-layout.css";
import "./styles/admin-layout.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <FavoriteProvider>
            <PlayerProvider>
              <App />
            </PlayerProvider>
          </FavoriteProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);