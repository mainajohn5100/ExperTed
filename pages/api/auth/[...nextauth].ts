import NextAuth, { type NextAuthOptions, type User, type Session, type JWT } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { IncomingMessage } from "http"; // For req type in authorize

// Define a type for the user object returned by authorize
interface AuthorizeUser extends User {
  id: string;
  // Add other custom properties your user object might have
}

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req: IncomingMessage | undefined): Promise<AuthorizeUser | null> {
        // `credentials` is now typed (Record<string, string> | undefined)
        // `req` is typed
        if (credentials && credentials.email && credentials.password) {
          // This is a MOCK user. Replace with actual user validation.
          // Ensure the returned user object matches AuthorizeUser structure
          const user: AuthorizeUser = { id: "1", name: "J Smith", email: credentials.email };
          return user;
        } else {
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as const, // Use "as const" for literal type
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | AuthorizeUser }): Promise<JWT> {
      // The user parameter here can be the initial user from authorize or adapter
      if (user) {
        token.id = user.id; // user.id should exist if AuthorizeUser or similar is used
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      // The token parameter is the JWT token from the jwt callback
      if (session.user && token.id) {
        // Add properties from token to session.user
        // Ensure session.user is defined and then add properties
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecretstring_changeme_in_production",
};

export default NextAuth(authOptions);
