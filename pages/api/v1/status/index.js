import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseMaxConnectionsResult = await database.query(
    "SHOW max_connections;",
  );
  const databaseName = process.env.POSTGRES_DB;
  const databaseCurrentConnectionsResult = await database.query({
    text: "SELECT COUNT(*)::int FROM pg_stat_activity WHERE datName = $1",
    values: [databaseName],
  });

  if (
    databaseVersionResult.rowCount === 0 ||
    databaseMaxConnectionsResult.rowCount === 0
  ) {
    return response.status(500).json({
      error: "Failed to retrieve PostgreSQL information.",
    });
  }

  const postgresVersion = databaseVersionResult.rows[0].server_version;
  const maxConnections = databaseMaxConnectionsResult.rows[0].max_connections;
  const currentConnections = databaseCurrentConnectionsResult.rows[0].count;

  response.status(200).json({
    updated_At: updatedAt,
    dependecies: {
      database: {
        version: postgresVersion,
        max_connections: maxConnections,
        current_connections: currentConnections,
      },
    },
  });
}

export default status;
