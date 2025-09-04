// prismaClient.js
const { PrismaClient } = require('./generated/prisma'); // <- use generated path
const prisma = new PrismaClient();
module.exports = prisma;
