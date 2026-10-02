import DefaultLayout from "interface/DefaultLayout";
import { Banner, Heading, Stack } from "@primer/react";
import useSWR from "swr";
import { Card } from "@primer/react/experimental";

async function FetchStatus(key) {
  const response = await fetch(`${window.location.origin}${key}`);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export default function StatusPage() {
  return (
    <DefaultLayout
      contentWidth="medium"
      metadata={{
        title: "Status",
        description: "Status e informação do sistema",
      }}
    >
      <Stack gap="spacious" layout="compact">
        <Heading as="h1">Status</Heading>
        <DatabaseStatus />
        <UpdateAt />
      </Stack>
    </DefaultLayout>
  );
}

function UpdateAt() {
  const { data, error, isLoading } = useSWR("/api/v1/status", FetchStatus, {
    refreshInterval: 2000,
  });

  let updatedAtText = "Carregando...";
  console.log("data", data);

  if (error) {
    return (
      <Banner variant="critical" layout="compact">
        <Banner.Title>Erro ao carregar o status</Banner.Title>

        <Banner.Description>{error.message}</Banner.Description>
      </Banner>
    );
  }

  if (!isLoading && data) {
    updatedAtText = new Date(data.updated_At).toLocaleString("pt-BR");
  }

  return (
    <Banner variant="info">
      <Banner.Title>Ultima atualização: {updatedAtText}</Banner.Title>
    </Banner>
  );
}

function DatabaseStatus() {
  const { data, error, isLoading } = useSWR("/api/v1/status", FetchStatus, {
    refreshInterval: 2000,
  });

  console.log({ data, error, isLoading });

  if (error) {
    return (
      <Banner variant="critical">
        <Banner.Title>
          Erro ao carregar informaçoes do banco de dados
        </Banner.Title>

        <Banner.Description>{error.message}</Banner.Description>
      </Banner>
    );
  }

  if (isLoading || !data) {
    return;
  }

  const database = data.dependencies.database;
  const openConnections = database.current_connections;
  const maxConnections = database.max_connections;
  const version = database.version || "-";

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        Database
      </Heading>
      <Stack direction={{ narrow: "vertical", regular: "horizontal" }}>
        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões abertas</Card.Heading>
            <Card.Description>{openConnections}</Card.Description>
            <Card.Metadata>Uso neste instante</Card.Metadata>
          </Card>
        </Stack.Item>

        <Stack.Item grow>
          <Card>
            <Card.Heading>Conexões máximas</Card.Heading>
            <Card.Description>{maxConnections}</Card.Description>
            <Card.Metadata>Conexões disponíveis</Card.Metadata>
          </Card>
        </Stack.Item>

        <Stack.Item grow>
          <Card>
            <Card.Heading>PostgreSQL</Card.Heading>
            <Card.Description>{version}</Card.Description>
            <Card.Metadata>Versão em execução</Card.Metadata>
          </Card>
        </Stack.Item>
      </Stack>
    </Stack>
  );
}
