import DefaultLayout from "interface/DefaultLayout";
import { useEffect } from "react";
import { useStoredUser } from "./api/v1/common/useStoredUser";

function Home() {
  const loggedUser = useStoredUser();

  useEffect(() => {
    if (loggedUser === null) {
      window.location.replace("/login");
    }
  }, [loggedUser]);

  return (
    <DefaultLayout
      metadata={{
        description:
          "Cuidando, controlando e aprimorando a saúde do seu paciente",
      }}
    >
      <h3>Bem vindo {loggedUser?.username || "-"}</h3>
      <h1>Cuidando, controlando e aprimorando a saúde do seu paciente</h1>
      <h3>Bem vindo {loggedUser || "-"}</h3>
    </DefaultLayout>
  );
}

export default Home;
