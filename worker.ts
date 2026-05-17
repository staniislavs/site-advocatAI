import { createRequestHandler } from "react-router";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

// Imported at bundle time by wrangler after `react-router build`
// @ts-ignore
import * as serverBuild from "./dist/server/index.js";

const requestHandler = createRequestHandler(serverBuild as any);

export interface Env {
  ASSETS: Fetcher;
  // Firebase config (set via wrangler secrets or wrangler.toml [vars])
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_DATABASE_ID?: string;
  // Telegram fallback (optional)
  TELEGRAM_BOT_TOKEN?: string;
}

// ─── Firebase initializer (safe for Workers — uses fetch internally) ──────────
function getFirebaseDB(env: Env) {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return getFirestore(app, env.VITE_FIREBASE_DATABASE_ID || "(default)");
}

// ─── CORS headers ─────────────────────────────────────────────────────────────
function corsHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

// ─── /api/test-telegram ───────────────────────────────────────────────────────
async function handleTestTelegram(request: Request): Promise<Response> {
  try {
    const { botToken, chatId } = (await request.json()) as {
      botToken?: string;
      chatId?: string;
    };

    if (!botToken || !chatId) {
      return Response.json(
        { error: "Missing botToken or chatId" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://api.telegram.org/bot${botToken.trim()}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text: "🧪 *Тестове повідомлення*\n\nВаш Telegram-бот успішно підключений до сайту!",
          parse_mode: "Markdown",
        }),
      }
    );

    const data = (await response.json()) as { ok: boolean; description?: string };
    if (data.ok) return Response.json({ success: true });
    return Response.json(
      { error: data.description || "Telegram error" },
      { status: 400 }
    );
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ─── /api/test-smtp ───────────────────────────────────────────────────────────
// Raw SMTP (TCP) is not available in Cloudflare Workers.
// Email notifications are handled by Firebase Cloud Functions (functions/src/index.ts).
async function handleTestSMTP(_request: Request): Promise<Response> {
  return Response.json(
    {
      error:
        "SMTP тест недоступний у Cloudflare Workers (відсутній TCP). " +
        "Використовуйте Firebase Cloud Functions для email-нотифікацій.",
      info: "Telegram-нотифікації працюють повноцінно.",
    },
    { status: 501 }
  );
}

// ─── /api/notify ──────────────────────────────────────────────────────────────
async function handleNotify(request: Request, env: Env): Promise<Response> {
  try {
    const { type, data } = (await request.json()) as {
      type: string;
      data: Record<string, string>;
    };

    const isLead = type === "new_lead";

    // Init Firebase
    const db = getFirebaseDB(env);

    // Fetch Telegram settings from Firestore
    const emailSettingsDoc = await getDoc(doc(db, "settings", "email"));
    const emailSettings = emailSettingsDoc.exists()
      ? emailSettingsDoc.data()
      : {};

    const clientName = data.clientName || "Клієнт";
    const phone = data.phone || "Не вказано";
    const service = data.serviceType || "Загальний запит";
    const message = data.message || "";

    const text =
      `🔔 *${isLead ? "НОВА ЗАЯВКА" : "НОВИЙ ВІДГУК"}*\n\n` +
      `👤 *Клієнт:* ${clientName}\n` +
      `📞 *Телефон:* \`${phone}\`\n` +
      `🛠 *Послуга:* ${service}\n` +
      `✉️ *Повідомлення:* ${message}`;

    const botToken =
      (emailSettings?.telegram?.botToken as string | undefined) ||
      env.TELEGRAM_BOT_TOKEN;

    let telegramSent = 0;

    if (botToken) {
      // Get active Telegram recipients from Firestore
      const tgSnap = await getDocs(
        query(
          collection(db, "notification_connections"),
          where("type", "==", "telegram"),
          where("isActive", "==", true)
        )
      );

      for (const connDoc of tgSnap.docs) {
        const chatId = connDoc.data().value as string;
        if (!chatId) continue;
        try {
          await fetch(
            `https://api.telegram.org/bot${botToken.trim()}/sendMessage`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId.trim(),
                text,
                parse_mode: "Markdown",
              }),
            }
          );
          telegramSent++;
        } catch (err) {
          console.error("[Worker notify] Telegram error for", chatId, err);
        }
      }
    }

    return Response.json({
      success: true,
      telegramSent,
      emailNote:
        "Email-нотифікації обробляються через Firebase Cloud Functions.",
    });
  } catch (err) {
    console.error("[Worker notify] Error:", err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

// ─── Main fetch handler ───────────────────────────────────────────────────────
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");

    // Handle OPTIONS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // ── API Routes ────────────────────────────────────────────────────────────
    if (url.pathname === "/api/notify" && request.method === "POST") {
      const res = await handleNotify(request, env);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
        res.headers.set(k, v)
      );
      return res;
    }

    if (url.pathname === "/api/test-telegram" && request.method === "POST") {
      const res = await handleTestTelegram(request);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
        res.headers.set(k, v)
      );
      return res;
    }

    if (url.pathname === "/api/test-smtp" && request.method === "POST") {
      const res = await handleTestSMTP(request);
      Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
        res.headers.set(k, v)
      );
      return res;
    }

    // ── Static assets ─────────────────────────────────────────────────────────
    // Serve files from dist/ (client assets, robots.txt, sitemap.xml, etc.)
    try {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    } catch {
      // Asset binding error — fall through to SSR
    }

    // ── SSR via React Router ──────────────────────────────────────────────────
    return requestHandler(request, { env, ctx });
  },
};
