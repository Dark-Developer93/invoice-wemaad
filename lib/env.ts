import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  EMAIL_SERVER_HOST: z.string().min(1),
  EMAIL_SERVER_PORT: z.coerce.number().int().positive(),
  // Allow empty strings so local Mailhog (no-auth SMTP) works out of the box.
  EMAIL_SERVER_USER: z.string().default(""),
  EMAIL_SERVER_PASSWORD: z.string().default(""),
  EMAIL_FROM: z.string().email(),
  CRON_SECRET: z.string().min(8),
  MAILTRAP_TOKEN: z.string().optional(),
  // Admin seeding — consumed by prisma/seed.mjs, documented here for discoverability.
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_FIRST_NAME: z.string().optional(),
  ADMIN_LAST_NAME: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  // SKIP_ENV_VALIDATION is set in the Dockerfile builder stage so `next build`
  // can compile without runtime env vars present. The NODE_ENV guard is removed
  // because `next build` always runs with NODE_ENV=production, which previously
  // made SKIP_ENV_VALIDATION ineffective during Docker image builds.
  if (process.env.SKIP_ENV_VALIDATION) {
    return process.env as unknown as Env;
  }
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${missing}`);
  }
  return result.data;
}

// Lazy singleton — validated once on first import, not at module definition time
// so Next.js build-time analysis doesn't fail when env is not yet set.
let _env: Env | null = null;
export function getEnv(): Env {
  if (!_env) _env = parseEnv();
  return _env;
}

// Convenience re-export for callers that just want the object
export const env = new Proxy({} as Env, {
  get(_, key: string) {
    return getEnv()[key as keyof Env];
  },
});
