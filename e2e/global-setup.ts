import { randomBytes } from "crypto";
import path from "path";
import { PrismaClient } from "@prisma/client";
import type { FullConfig } from "@playwright/test";
import { cleanupE2EUser } from "./cleanup";

// E2E users are bypass-authenticated by writing a Session row directly
// (Auth.js's database strategy uses the session cookie value as a literal
// lookup key into Session.sessionToken — no JWT/signing involved) and
// handing Playwright a matching storageState cookie. This never touches
// lib/auth.ts, so there's zero risk of an E2E-only code path leaking into
// the real login flow.
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const E2E_USER_EMAIL = "e2e-user@example.test";
export const E2E_ADMIN_EMAIL = "e2e-admin@example.test";

async function createAuthedUser(
  prisma: PrismaClient,
  { email, isAdmin }: { email: string; isAdmin: boolean }
) {
  // firstName/lastName/address all need to be set, or the dashboard layout
  // redirects to /onboarding before a test ever reaches the page it wants.
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      isAdmin,
      isActive: true,
      emailVerified: new Date(),
      plan: "FREE",
      firstName: "E2E",
      lastName: isAdmin ? "Admin" : "User",
      address: "1 Test Street, Testville",
    },
    create: {
      email,
      firstName: "E2E",
      lastName: isAdmin ? "Admin" : "User",
      address: "1 Test Street, Testville",
      isAdmin,
      isActive: true,
      emailVerified: new Date(),
      plan: "FREE",
    },
  });

  await prisma.session.deleteMany({ where: { userId: user.id } });
  const sessionToken = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + SESSION_MAX_AGE_MS),
    },
  });

  return { user, sessionToken };
}

function storageStateFor(sessionToken: string, baseURL: string) {
  const { hostname } = new URL(baseURL);
  return {
    cookies: [
      {
        name: "authjs.session-token",
        value: sessionToken,
        domain: hostname,
        path: "/",
        expires: Math.floor((Date.now() + SESSION_MAX_AGE_MS) / 1000),
        httpOnly: true,
        secure: false,
        sameSite: "Lax" as const,
      },
    ],
    origins: [],
  };
}

export default async function globalSetup(config: FullConfig) {
  const prisma = new PrismaClient();
  const baseURL = config.projects[0]?.use?.baseURL ?? "http://localhost:3100";

  try {
    // Clean up any leftovers from a prior interrupted run before reseeding.
    await cleanupE2EUser(prisma, E2E_USER_EMAIL);
    await cleanupE2EUser(prisma, E2E_ADMIN_EMAIL);

    const { sessionToken: userToken } = await createAuthedUser(prisma, {
      email: E2E_USER_EMAIL,
      isAdmin: false,
    });
    const { sessionToken: adminToken } = await createAuthedUser(prisma, {
      email: E2E_ADMIN_EMAIL,
      isAdmin: true,
    });

    const fs = await import("fs/promises");
    const authDir = path.join(__dirname, ".auth");
    await fs.mkdir(authDir, { recursive: true });
    await fs.writeFile(
      path.join(authDir, "user.json"),
      JSON.stringify(storageStateFor(userToken, baseURL), null, 2)
    );
    await fs.writeFile(
      path.join(authDir, "admin.json"),
      JSON.stringify(storageStateFor(adminToken, baseURL), null, 2)
    );
  } finally {
    await prisma.$disconnect();
  }
}
