
const FALLBACK_LOCAL = "http://127.0.0.1:8000";

/** True when running in the browser. */
function isBrowser() {
  return typeof window !== "undefined";
}

function pickBaseUrl() {
  // Client: must use public env
  if (isBrowser()) {
    return process.env.NEXT_PUBLIC_API_BASE || FALLBACK_LOCAL;
  }

  // Server: prefer a server-only env (not exposed to browser)
  // then fall back to NEXT_PUBLIC_API_BASE, then local.
  return process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || FALLBACK_LOCAL;
}

const API_BASE = pickBaseUrl();

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

/** Small helper to keep errors readable. */
async function readBodySafe(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

/** Abort fetch after timeoutMs (helps avoid “fetch failed” hangs). */
function withTimeout(timeoutMs: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return { controller, clear: () => clearTimeout(id) };
}

export async function apiGet<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number }
): Promise<T> {
  const url = joinUrl(API_BASE, path);

  const timeoutMs = init?.timeoutMs ?? 12_000; // good default for local + prod
  const { controller, clear } = withTimeout(timeoutMs);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
      },
    });

    if (!res.ok) {
      const text = await readBodySafe(res);
      throw new Error(
        `API ${res.status} ${res.statusText} on ${url}\n` +
          (text ? `Body: ${text.slice(0, 1200)}` : "Body: <empty>")
      );
    }

    return (await res.json()) as T;
  } catch (err: any) {
    // Make abort errors easier to understand
    if (err?.name === "AbortError") {
      throw new Error(`API timeout after ${timeoutMs}ms on ${url}`);
    }
    throw err;
  } finally {
    clear();
  }
}
