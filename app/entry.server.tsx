import './i18n';

import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: AppLoadContext
) {
  const userAgent = request.headers.get("user-agent");

  // Bots and SPA mode wait for full render; streaming for regular users
  const waitForAll =
    (userAgent && isbot(userAgent)) || routerContext.isSpaMode;

  let status = responseStatusCode;

  const stream = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        console.error("[SSR Error]", error);
        status = 500;
      },
    }
  );

  if (waitForAll) {
    await stream.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");

  return new Response(stream, {
    headers: responseHeaders,
    status,
  });
}
