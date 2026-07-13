const { exec } = require("node:child_process");

function checkPostgresService() {
    exec("docker compose -f infra/compose.yaml exec -T database pg_isready --host localhost", (error, stdout, stderr) => {
        const output = `${stdout}${stderr}`.trim();

        if (error) {
            process.stdout.write(".");
            checkPostgresService();
            return;
        }

        if (output.includes("accepting connections")) {
            console.log("🟢 Banco de dados está pronto para novas conexões");
            return;
        }

        console.log(output || "🟢 Banco de dados está pronto para novas conexões");
    });
}

process.stdout.write("\n\n⏲️ Aguardando pelo serviço de postgres");
checkPostgresService();