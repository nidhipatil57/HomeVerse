"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const userCount = await prisma.user.count();
    const complaintCount = await prisma.complaint.count();
    const visitorCount = await prisma.visitor.count();
    const paymentCount = await prisma.residentPayment.count();
    const billCount = await prisma.maintenanceBill.count();
    console.log("DATABASE_COUNTS:", {
        userCount,
        complaintCount,
        visitorCount,
        paymentCount,
        billCount
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
