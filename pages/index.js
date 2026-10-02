import DefaultLayout from "interface/DefaultLayout";
import { Stack } from "@primer/react";
import { useEffect, useState } from "react";

function Home() {
  const STORAGE_KEY = "caduceus:user";
  const [loggedUser, setLoggedUser] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        setLoggedUser(parsed.username);
      } else {
        location.href = "/login";
      }
    } catch {
      // Ignore malformed or unavailable storage; defaults already apply.
    }
  });

  return (
    <DefaultLayout
      metadata={{
        description:
          "Cuidando, controlando e aprimorando a saúde do seu paciente",
      }}
    >
      <h1>Cuidando, controlando e aprimorando a saúde do seu paciente</h1>
      <h3>Bem vindo {loggedUser || "-"}</h3>
    </DefaultLayout>
  );
}

export default Home;
