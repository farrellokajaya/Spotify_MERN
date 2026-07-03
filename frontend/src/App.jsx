import { useEffect, useState } from "react";
import { getHealthStatus } from "./services/api";
import "./App.css";

function App() {
  const [status, setStatus] = useState("Connecting to backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const data = await getHealthStatus();
        setStatus(data.message);
      } catch (err) {
        setError(err.message);
      }
    };

    checkBackend();
  }, []);

  return (
    <main className="app">
      <section className="status-card">
        <h1>Soundify</h1>
        <p>Music streaming application built with MERN Stack.</p>

        {error ? (
          <p className="status error">{error}</p>
        ) : (
          <p className="status success">{status}</p>
        )}
      </section>
    </main>
  );
}

export default App;