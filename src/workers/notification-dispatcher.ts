import "dotenv/config";
import prisma from "../config/prisma.js";
import logger from "../config/logger.js";
import {runNotificationDispatcher} from "../services/notification-dispatcher.service.js";

runNotificationDispatcher().catch((error)=>{logger.error(`Notification dispatcher failed: ${error instanceof Error?error.stack:error}`);process.exitCode=1;}).finally(()=>prisma.$disconnect());
