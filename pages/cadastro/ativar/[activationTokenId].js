import DefaultLayout from "interface/DefaultLayout";
import { Banner } from "@primer/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ActivateUserPage() {
  const router = useRouter();

  const activationTokenId = router.query.activationTokenId;
  const [activationStatus, setActivationStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    // Setup
    if (!activationTokenId) {
      return;
    }

    sendActivationRequest();

    async function sendActivationRequest() {
      try {
        const response = await fetch(
          `/api/v1/activations/${activationTokenId}`,
          {
            method: "PATCH",
            signal: AbortSignal.timeout(10000),
          },
        );

        const activationResponseBody = response.json();

        if (response.status === 200) {
          setActivationStatus("success");
          return;
        }

        setErrorMessage(
          `${activationResponseBody.message} ${activationResponseBody.action}`,
        );
        setActivationStatus("failure");
      } catch {
        setErrorMessage(
          "Houve uma falha de conexão com o servidor. Tente novamente mais tarde.",
        );
        setActivationStatus("failure");
      }
    }
  }, [activationTokenId]);

  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Ativar Cadastro",
      }}
    >
      {activationStatus === "loading" && (
        <Banner variant="info">
          <Banner.Title>Verificando Token...</Banner.Title>
        </Banner>
      )}

      {activationStatus === "success" && (
        <Banner variant="success">
          <Banner.Title>Cadastro ativado com sucesso</Banner.Title>
          <Banner.Description>
            Sua conta já está ativa e você já pode{" "}
            <a heref="/login">fazer o login</a>
          </Banner.Description>
        </Banner>
      )}

      {activationStatus === "failure" && (
        <Banner variant="critical">
          <Banner.Title>Não foi possivel ativar seu cadastro</Banner.Title>
          <Banner.Description>{errorMessage}</Banner.Description>
        </Banner>
      )}
    </DefaultLayout>
  );
}
