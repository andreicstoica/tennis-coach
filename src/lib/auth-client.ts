import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import "dotenv/config";

export const authClient = createAuthClient({
  // Removed baseURL to let better-auth use relative URLs when on same domain
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
