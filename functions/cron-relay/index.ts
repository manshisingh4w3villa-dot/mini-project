// functions/cron-relay/index.ts
//
// Neon Function — cron relay for marking completed bookings.
//
// This function is invoked by a Neon Function Trigger (type: "schedule") every
// 15 minutes. It:
//   1. Validates the inbound Neon trigger delivery signature.
//   2. POSTs to the deployed Vercel backend's /api/cron/update-bookings endpoint
//      with the CRON_SECRET for authentication.
//   3. Returns the backend's response as its own response.
//
// Environment variables required (set via neon deploy --env .env.functions):
//   BACKEND_URL  — The deployed Vercel backend base URL, e.g.
//                  https://mini-project-backend-beta.vercel.app
//   CRON_SECRET  — The shared secret expected by the backend's cron route.
//
// Neon injects DATABASE_URL automatically, but this function does not
// need it — it only talks to the backend over HTTPS.

import { parseTriggerDelivery } from "@neon/functions/triggers";

const BACKEND_URL = process.env.BACKEND_URL;
const CRON_SECRET = process.env.CRON_SECRET;

export default {
  async fetch(request: Request): Promise<Response> {
    // 1. Authenticate the inbound Neon trigger delivery.
    //    parseTriggerDelivery returns null if the signature is invalid.
    const trigger = parseTriggerDelivery(request);
    if (!trigger) {
      console.warn("cron-relay: rejected unauthenticated request");
      return new Response("Forbidden", { status: 403 });
    }

    // 2. Validate config.
    if (!BACKEND_URL || !CRON_SECRET) {
      console.error("cron-relay: BACKEND_URL or CRON_SECRET is not set");
      return new Response("Misconfigured", { status: 503 });
    }

    const targetUrl = `${BACKEND_URL.replace(/\/$/, "")}/api/cron/update-bookings`;

    console.log(`cron-relay: POSTing to ${targetUrl}`);

    // 3. Forward to the Vercel backend.
    let backendRes: Response;
    try {
      backendRes = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${CRON_SECRET}`,
        },
      });
    } catch (err) {
      console.error("cron-relay: fetch to backend failed:", err);
      return new Response("Backend unreachable", { status: 502 });
    }

    const body = await backendRes.text();
    console.log(`cron-relay: backend responded ${backendRes.status}: ${body}`);

    return new Response(body, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  },
};

