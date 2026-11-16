"use client";

import { useEffect } from "react";

const DEDUPE_WINDOW_MS = 750;
const VOLATILE_BODY_KEYS = new Set(["id", "createdAt", "updatedAt", "timestamp", "requestId", "transactionId"]);

function normalizeBody(body: BodyInit | null | undefined): string | null {
  if (typeof body !== "string") return body == null ? "" : null;

  try {
    const normalize = (value: any): any => {
      if (Array.isArray(value)) return value.map(normalize);
      if (!value || typeof value !== "object") return value;
      return Object.fromEntries(
        Object.keys(value)
          .filter((key) => !VOLATILE_BODY_KEYS.has(key))
          .sort()
          .map((key) => [key, normalize(value[key])])
      );
    };
    return JSON.stringify(normalize(JSON.parse(body)));
  } catch {
    return body;
  }
}

export function MutationRequestGuard() {
  useEffect(() => {
    const guardedWindow = window as typeof window & { __homeverseMutationFetchGuarded?: boolean };
    if (guardedWindow.__homeverseMutationFetchGuarded) return;

    const originalFetch = window.fetch.bind(window);
    const pendingMutations = new Map<string, Promise<Response>>();

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const isRequest = typeof Request !== "undefined" && input instanceof Request;
      const method = (init?.method || (isRequest ? input.method : "GET")).toUpperCase();
      if (["GET", "HEAD", "OPTIONS"].includes(method)) return originalFetch(input, init);

      // Request bodies cannot be read synchronously without consuming the request.
      if (isRequest && init?.body === undefined) return originalFetch(input, init);

      const url = isRequest ? input.url : String(input);
      const body = normalizeBody(init?.body);
      if (body === null) return originalFetch(input, init);

      const requestHeaders = new Headers(init?.headers || (isRequest ? input.headers : undefined));
      const identity = requestHeaders.get("authorization") || "cookie-session";
      const key = `${identity}\n${method}\n${url}\n${body}`;
      const existing = pendingMutations.get(key);
      if (existing) return existing.then((response) => response.clone());

      const request = originalFetch(input, init);
      pendingMutations.set(key, request);
      request.then(
        () => window.setTimeout(() => {
          if (pendingMutations.get(key) === request) pendingMutations.delete(key);
        }, DEDUPE_WINDOW_MS),
        () => {
          if (pendingMutations.get(key) === request) pendingMutations.delete(key);
        }
      );
      return request.then((response) => response.clone());
    }) as typeof window.fetch;

    guardedWindow.__homeverseMutationFetchGuarded = true;
  }, []);

  return null;
}
