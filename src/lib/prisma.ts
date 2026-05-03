// src/lib/prisma.ts
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  // ดึง URL จาก .env มาสร้าง Connection
  const connectionString = process.env.DATABASE_URL
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  // โยน adapter เข้าไปใน PrismaClient (กฎใหม่ของ v7)
  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()
export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma