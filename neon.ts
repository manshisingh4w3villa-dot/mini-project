import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,

  // ── Neon Functions ──────────────────────────────────────────────────────────
  // cron-relay: forwards the scheduled trigger to the Vercel backend so that
  // completed bookings are marked automatically every 15 minutes.
  functions: {
    cronrelay: {
      name: "booking cron relay",
      source: "functions/cron-relay/index.ts",
      // Environment variables required at deploy time.
      // Run: neon deploy --env .env.functions
      env: {
        // The deployed Vercel backend base URL
        BACKEND_URL: process.env.BACKEND_URL!,
        // Shared secret that the backend /api/cron/update-bookings expects
        CRON_SECRET: process.env.CRON_SECRET!,
      },
    },
  },

  // ── Branch policy ──────────────────────────────────────────────────────────
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch (production): cron trigger every 15 minutes
      return {
        functions: {
          cronrelay: {
            triggers: [
              {
                type: "schedule",
                name: "Mark completed bookings",
                // Every 15 minutes — fine-grained enough for booking UX;
                // change to "*/5 * * * *" for 5-minute granularity if needed.
                schedule: { cron: "*/15 * * * *" },
              },
            ],
          },
        },
      };
    }

    if (!branch.exists) {
      // New non-default branches: auto-expire after 7 days
      return { ttl: "7d" };
    }

    // Existing non-default branch: no changes
    return {};
  },
});
