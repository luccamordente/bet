import fetch, { Headers } from "node-fetch";

const trustCode =
  "3c84a514550800652d6b7a99a45549f22683f822a58bfe234cd4f4cc874f9d3a";

const DEFAULT_OPTIONS = {
  compress: true,
  timeout: 10000,
};

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-Api-Key": "CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R", // TODO can we get a different API key?
  "X-Device-Uuid": "441c0a6b-9cf666fe-38d75bda-32c8e40d", // TODO get a different Device UUID
  Referer: "https://www.pinnacle.com/en/soccer/leagues/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15",
};

let sessionToken: string;

function setToken(token: string) {
  sessionToken = token;
}

interface LoginResponse {
  token: string;
}

async function login(): Promise<LoginResponse> {
  return await guestRequest<LoginResponse>(
    "https://guest.api.arcadia.pinnacle.com/0.1/sessions",
    {
      method: "POST",
      body: JSON.stringify({
        username: "poluga@protonmail.com",
        password: "YNm!%r%7ha32T6uWVYur",
        captchaToken: "",
        trustCode,
      }),
    },
  );
}

async function authenticate(): Promise<void> {
  const { token } = await login();
  setToken(token);
}

interface RequestOptions {
  method?: string;
  body?: string;
}

async function guestRequest<T>(
  url: string,
  options?: RequestOptions,
): Promise<T> {
  const fetchOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    headers: new Headers({ ...DEFAULT_HEADERS }),
  };

  let json;
  const resp = await fetch(url, fetchOptions);

  if (!resp.ok) {
    throw new Error(
      `Unexpected response from Pinnacle: ${JSON.stringify(resp, null, 2)}`,
    );
  }

  try {
    json = await resp.json();
  } catch (err) {
    console.error(err);
    throw new Error("Unexpected error parsing guest response.");
  }

  return json;
}

export default async function request<T>(url: string): Promise<T> {
  const fetchOptions = {
    ...DEFAULT_OPTIONS,
    headers: new Headers({ ...DEFAULT_HEADERS }),
  };

  if (sessionToken !== undefined) {
    fetchOptions.headers.set("X-Session", sessionToken);
  }

  const resp = await fetch(url, fetchOptions);

  if (!resp.ok) {
    throw new Error(
      `Unexpected response from Pinnacle: ${JSON.stringify(resp, null, 2)}`,
    );
  }

  // Unautheticated
  if (resp.url.startsWith("https://guest")) {
    await authenticate();
    return await request<T>(url);
  }

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    console.error(err);
    throw new Error("Unexpected error parsing response.");
  }

  return json;
}
