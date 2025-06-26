import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through a props object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        // For now, we'll return a mock user if the email and password are not empty
        // In a real application, you'd validate against a database
        if (credentials && credentials.email && credentials.password) {
          // This is a MOCK user. Replace with actual user validation.
          const user = { id: "1", name: "J Smith", email: credentials.email }
          return user
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin', // Optionally, define a custom sign-in page
    // error: '/auth/error', // Error code passed in query string as ?error=
    // signOut: '/auth/signout', // Redirects to home page after sign out
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persist the user id to the token right after signin
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
          session.user.id = token.id // Add id to session
      }
      return session
    }
  },
  // A secret is only needed for non-database sessions, which we're using here.
  // In production, you should set a strong secret.
  // You can generate one with `openssl rand -base64 32`
  secret: process.env.NEXTAUTH_SECRET || "supersecretstring_changeme_in_production",
}

export default NextAuth(authOptions)
