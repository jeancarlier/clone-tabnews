import DefaultLayout from "interface/DefaultLayout";
import { Banner } from "@primer/react";

export default function ConfirmRegisterPage() {
  return (
    <DefaultLayout>
      <Banner
        variant="warning"
        title="Falta só uma etapa!"
        description="Abra o email enviado pelo Caduceus e clique no link para ativar seu cadastro"
      />
    </DefaultLayout>
  );
}
