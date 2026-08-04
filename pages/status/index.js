import useSWR from "swr";

async function FetchStatus(key) {
  const response = await fetch(`${window.location.origin}${key}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdateAt />
      <DatabaseStatus />
    </>
  );
}

function UpdateAt() {
  const { data, error, isLoading } = useSWR("/api/v1/status", FetchStatus, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  console.log("data", data);

  if (error) {
    updatedAtText = `Erro ao carregar status: ${error.message}`;
  }

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_At).toLocaleString("pt-BR");
  }

  return <div>Ultima atualização: {updatedAtText}</div>;
}

function DatabaseStatus() {
  const { data, error, isLoading } = useSWR("/api/v1/status", FetchStatus, {
    refreshInterval: 2000,
  });

  console.log({ data, error, isLoading });

  let databaseInfo = "Carregando...";

  if (error) {
    databaseInfo = `Erro ao carregar database version: ${error.message}`;
  }

  if (!isLoading && data) {
    databaseInfo = (
      <>
        <div>
          Versão do banco de dados: {data.dependencies.database.version}
        </div>
        <div>
          Conexões máximas: {data.dependencies.database.max_connections}
        </div>
        <div>
          Conexões atuais: {data.dependencies.database.current_connections}
        </div>
      </>
    );
  }

  return (
    <>
      <h2>Database Status</h2>
      <div>{databaseInfo}</div>
    </>
  );
}
