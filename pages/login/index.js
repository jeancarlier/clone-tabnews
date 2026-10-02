import DefaultLayout from "interface/DefaultLayout";
import { TextInput, Stack, FormControl, Button } from "@primer/react";
import { useState, useEffect } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const STORAGE_KEY = "caduceus:user";

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log(parsed);
        location.href = "/";
      }
    } catch {
      // Ignore malformed or unavailable storage; defaults already apply.
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();

    const requestBody = { email, password };
    const response = await fetch("/api/v1/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 201) {
      const user = await getUser();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      location.href = "/";
    }
  }

  async function getUser() {
    const response = await fetch("/api/v1/user");
    const responseBody = response.json();
    return responseBody;
  }

  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Login",
        description: "Realize o login da applicação para acessar mais recursos",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="spacious">
          <FormControl>
            <FormControl.Label>Email</FormControl.Label>
            <TextInput
              type="text"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
              }}
              block
            />
          </FormControl>

          <FormControl>
            <FormControl.Label>Password:</FormControl.Label>
            <TextInput
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              block
            />
          </FormControl>

          <Stack.Item>
            <Button type="submit" variant="primary">
              Login
            </Button>
          </Stack.Item>
        </Stack>
      </form>
    </DefaultLayout>
  );
}
