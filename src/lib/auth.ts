import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "~/server/db"; // drizzle instance
 
export const auth = betterAuth({

    emailAndPassword: {
        enabled: true
    },
    
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    },

    database: drizzleAdapter(db, {
        provider: "pg", 
    }),

    plugins: [nextCookies()]
});