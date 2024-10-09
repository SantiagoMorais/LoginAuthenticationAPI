import { z } from "zod";

const envSchema = z.object({
    DB_USER: z.string(),
    DB_PASSWORD: z.string()
})

export const env = envSchema.parse(process.env)
