import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import "dotenv/config";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
