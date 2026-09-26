import Head from "next/head";
import { PageLayout, Header, Text } from "@primer/react";
import styles from "./index.module.css";

const contentWidthClasses = {
  small: styles.smallContent,
};

export default function DefaultLayout({
  children,
  metadata = {},
  contentWidth,
}) {
  console.log("ContentWidth: " + contentWidth);
  const extraContentClassName = contentWidthClasses[contentWidth];
  console.log("Extra content class name: " + extraContentClassName);
  return (
    <>
      <Head>
        <title>
          {metadata.title ? `${metadata.title} · Caduceus` : "Caduceus"}
        </title>
        {metadata.description && (
          <meta name="description" content={metadata.description} />
        )}
      </Head>
      <Header>
        <Header.Item full>
          <Header.Link href="/">Caduceus</Header.Link>
        </Header.Item>

        <Header.Item>
          <Header.Link href="/Login">Login</Header.Link>
        </Header.Item>

        <Header.Item>
          <Header.Link href="/cadastro">Cadastrar</Header.Link>
        </Header.Item>
      </Header>
      <PageLayout>
        <PageLayout.Content
          width={contentWidth}
          className={extraContentClassName}
        >
          {children}
        </PageLayout.Content>
        <PageLayout.Footer divider="line">
          <Text size="small"> © {new Date().getFullYear()} Caduceus </Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  );
}
