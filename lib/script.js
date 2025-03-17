import { PrismaClient } from '@prisma/client';

const prismaSingleton = () => {
    return new PrismaClient();
}
const prisma=globalThis.prismaGlobal ?? prismaSingleton();
export default prisma;

if(process.env.NODE_ENV !== "production") globalThis.prismaGlobal=prisma;