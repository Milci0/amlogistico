import { PrismaClient } from '@prisma/client'

// Singleton — w środowisku serverless (Vercel) i przy hot-reload nie chcemy
// tworzyć nowego klienta (a więc i puli połączeń) przy każdym żądaniu.
const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
