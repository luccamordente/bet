import fetch from "node-fetch";
import { assertEnv } from "@bet/assert";

assertEnv(
  process.env,
  "API_KEY",
  "DEVICE_UUID",
  "TRUST_CODE",
  "USERNAME",
  "PASSWORD",
);
const { API_KEY, DEVICE_UUID, TRUST_CODE, USERNAME, PASSWORD } = process.env;

const DEFAULT_OPTIONS = {
  compress: true,
  timeout: 10000,
};

const DEFAULT_HEADERS: { [key: string]: string } = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-Api-Key": API_KEY, // TODO can we get a different API key?
  "X-Device-Uuid": DEVICE_UUID, // TODO get a different Device UUID
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
        username: USERNAME,
        password: PASSWORD,
        captchaToken: "",
        trustCode: TRUST_CODE,
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
    headers: DEFAULT_HEADERS,
  };

  let json;
  const resp = await fetch(url, fetchOptions);

  if (!resp.ok) {
    console.error(resp);
    throw new Error(`Unexpected response from Pinnacle`);
  }

  try {
    json = await resp.json();
  } catch (err) {
    console.error(err);
    throw err;
  }

  return json;
}

export default async function request<T>(url: string): Promise<T> {
  const fetchOptions = {
    ...DEFAULT_OPTIONS,
    headers: {
      ...DEFAULT_HEADERS,
      ...(sessionToken != null ? { "X-Session": sessionToken } : null),
    },
  };

  const resp = await fetch(url, fetchOptions);

  if (!resp.ok) {
    console.error(resp);
    throw new Error(`Unexpected response from Pinnacle`);
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
    throw err;
  }

  return json;
}
