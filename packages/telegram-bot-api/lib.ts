import fetch, { BodyInit } from "node-fetch";
import { URL } from "url";

interface Sucess<T> {
  readonly ok: true;
  readonly description?: string;
  readonly result: T;
}

interface Failure {
  readonly ok: false;
  readonly description: string;
  readonly error_code: number;
  readonly parameters?: FailureParameters;
}

interface FailureParameters {
  readonly migrate_to_chat_id?: number;
  readonly retry_after?: number;
}

interface ExecuteParams {
  readonly url: string | URL;
  readonly method: "GET" | "POST";
  readonly headers?: { [key: string]: string };
  readonly body?: BodyInit;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

async function execute<T>(params: ExecuteParams): Promise<Sucess<T> | Failure> {
  const resp = await fetch(params.url, {
    method: params.method,
    headers: {
      Accept: "application/json",
      ...params.headers,
    },
    body: params.body,
    timeout: params.timeout,
    signal: params.signal
  });

  let json;
  try {
    json = await resp.json();
  } catch (error) {
    throw new Error("Unexpected failure parsing Telegram API response");
  }

  return json;
}

interface ExecuteParams {
  readonly url: string | URL;
  readonly method: "GET" | "POST";
  readonly body?: BodyInit;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

interface RequestEmpty {
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

export function createGETEmpty<T>(url: string) {
  return async (request: RequestEmpty = {}) =>
    execute<T>({
      url,
      method: "GET",
      signal: request.signal,
      timeout: request.timeout
    });
}

interface Request<T extends object> {
  readonly params: T;
  readonly timeout?: number;
  readonly signal?: AbortSignal;
}

export function createGET<T, U extends object>(url: string) {
  return async (request: Request<U>) => {
    const newUrl = new URL(url);

    for (const [key, val] of Object.entries(request.params)) {
      newUrl.searchParams.set(key, String(val));
    }

    return execute<T>({
      url: newUrl,
      method: "GET",
      signal: request.signal,
      timeout: request.timeout
    });
  };
}

export function createPOST<T, U extends object>(url: string) {
  return async (request: Request<U>) => {
    return execute<T>({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.params),
      signal: request.signal,
      timeout: request.timeout
    });
  };
}

// `AbortSignal` is defined here to prevent a dependency on a particular
// implementation like the `abort-controller` package.
interface AbortSignal {
  readonly aborted: boolean;

  readonly addEventListener: (
    type: "abort",
    listener: (this: AbortSignal, event: any) => any,
    options?:
      | boolean
      | {
          capture?: boolean;
          once?: boolean;
          passive?: boolean;
        }
  ) => void;

  readonly removeEventListener: (
    type: "abort",
    listener: (this: AbortSignal, event: any) => any,
    options?:
      | boolean
      | {
          capture?: boolean;
        }
  ) => void;

  readonly dispatchEvent: (event: any) => boolean;

  readonly onabort?: null | ((this: AbortSignal, event: any) => void);
}
