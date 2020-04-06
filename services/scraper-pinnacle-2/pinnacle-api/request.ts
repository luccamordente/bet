import fetch, { Headers } from "node-fetch";

const DEFAULT_OPTIONS = {
  compress: true,
  timeout: 10000,
};

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-Api-Key": "CmX2KcMrXuFmNg6YFbmTxE0y9CIrOi0R", // TODO can we get a different API key?
  "X-Device-Uuid": "995eb6f3-65211f6e-e22c04e9-42a211b8", // TODO get a different Device UUID
  Referrer: "https: //www.pinnacle.com/en/soccer/leagues/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15",
};

export default async function request<T>(url: string): Promise<T> {
  const options = {
    ...DEFAULT_OPTIONS,
    headers: new Headers({
      ...DEFAULT_HEADERS,
    }),
  };

  let resp;
  try {
    resp = await fetch(url, options);
    if (!resp.ok) {
      throw new Error(
        `Unexpected response from Pinnacle: ${JSON.stringify(resp, null, 2)}`
      );
    }
  } catch (err) {
    throw new Error("Unexpected error parsing Pinnacle response.");
  }
  return resp.json();
}
