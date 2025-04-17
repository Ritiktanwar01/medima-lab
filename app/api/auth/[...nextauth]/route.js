import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect()

        if (!credentials?.username || !credentials?.password) {
          throw new Error("Please provide username and password")
        }

        // Find user by username
        const user = await User.findOne({ username: credentials.username }).select("+password")

        if (!user) {
          throw new Error("Invalid username or password")
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(credentials.password, user.password)

        if (!isMatch) {
          throw new Error("Invalid username or password")
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role,
          labName: user.labName,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.labName = user.labName
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.labName = token.labName
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.JWT_SECRET, // Use the same secret for JWT
    encryption: false, // Disable encryption to avoid decryption errors
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
