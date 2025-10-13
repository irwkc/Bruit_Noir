import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt:', { email: credentials?.email })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        // Use shared Prisma instance
        const { prisma } = await import('@/lib/prisma')

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        console.log('👤 User found:', { 
          id: user?.id, 
          email: user?.email, 
          hasPassword: !!user?.password,
          emailVerified: user?.emailVerified 
        })

        if (!user || !user.password) {
          console.log('❌ No user or password')
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          console.log('❌ Email not verified')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        console.log('🔑 Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('❌ Invalid password')
          return null
        }

        console.log('✅ Auth successful for:', user.email)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        ;(token as any).id = (user as any).id
        ;(token as any).role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id
        (session.user as any).role = (token as any).role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}

