import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  EMAIL_SERVER_HOST: z.string().min(1),
  EMAIL_SERVER_PORT: z.coerce.number().int().positive(),
  EMAIL_SERVER_USER: z.string().min(1),
  EMAIL_SERVER_PASSWORD: z.string().min(1),
  EMAIL_FROM: z.string().email(),
  CRON_SECRET: z.string().min(8),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
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
