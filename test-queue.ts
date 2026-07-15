import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { firstName: { contains: "Elyas" } }
    });
    console.log("User:", user);
    if (!user) return;
    
    const queueEntry = await prisma.loanQueueEntry.findMany({
        where: { account: { userId: user.id } }
    });
    console.log("Queue Entries:", queueEntry);
    
    const achievements = await prisma.userAchievement.findMany({
        where: { userId: user.id }
    });
    console.log("Achievements:", achievements);
}
main().catch(console.error).finally(() => prisma.$disconnect());
