import webpush from "web-push";
import prisma from "../config/prisma.js";
import {env} from "../config/env.js";
import logger from "../config/logger.js";
import {deliveryBackoffMs,MAX_DELIVERY_ATTEMPTS,MAX_REMINDER_MINUTES,notificationPayload,notificationScheduledFor} from "../utils/notification.js";

function configure(){if(!env.WEB_PUSH_VAPID_PUBLIC_KEY||!env.WEB_PUSH_VAPID_PRIVATE_KEY)throw new Error("Web push VAPID keys are not configured");webpush.setVapidDetails(env.WEB_PUSH_SUBJECT,env.WEB_PUSH_VAPID_PUBLIC_KEY,env.WEB_PUSH_VAPID_PRIVATE_KEY);}

export async function enqueueDueNotifications(now=new Date()){
  const tasks=await prisma.academicTask.findMany({where:{is_complete:false,reminder_offset_minutes:{not:null},due_at:{gte:new Date(now.getTime()-24*60*60_000),lte:new Date(now.getTime()+MAX_REMINDER_MINUTES*60_000)}},include:{course:{include:{semester:{select:{user_id:true}}}}}});
  const userIds=[...new Set(tasks.map((task)=>task.course.semester.user_id))];
  const subscriptions=userIds.length?await prisma.pushSubscription.findMany({where:{user_id:{in:userIds}}}):[];
  let enqueued=0;
  for(const task of tasks){const offset=task.reminder_offset_minutes;if(offset===null)continue;const scheduledFor=notificationScheduledFor(task.due_at,offset);if(scheduledFor>now||scheduledFor<new Date(now.getTime()-24*60*60_000))continue;for(const subscription of subscriptions.filter((item)=>item.user_id===task.course.semester.user_id)){await prisma.notificationDelivery.upsert({where:{task_id_subscription_id_scheduled_for:{task_id:task.id,subscription_id:subscription.id,scheduled_for:scheduledFor}},create:{task_id:task.id,subscription_id:subscription.id,scheduled_for:scheduledFor,available_at:now},update:{}});enqueued+=1;}}
  return enqueued;
}

export async function dispatchDueNotifications(now=new Date(),limit=50){
  configure();
  await prisma.notificationDelivery.updateMany({where:{status:"CLAIMED",claimed_at:{lt:new Date(now.getTime()-10*60_000)}},data:{status:"FAILED",claimed_at:null,available_at:now,last_error:"Recovered stale claim"}});
  const candidates=await prisma.notificationDelivery.findMany({where:{status:{in:["PENDING","FAILED"]},attempts:{lt:MAX_DELIVERY_ATTEMPTS},scheduled_for:{lte:now},available_at:{lte:now}},orderBy:[{scheduled_for:"asc"},{created_at:"asc"}],take:limit,include:{subscription:true,task:{include:{course:{select:{name:true,course_code:true}}}}}});
  let sent=0;let failed=0;
  for(const delivery of candidates){const claimed=await prisma.notificationDelivery.updateMany({where:{id:delivery.id,status:{in:["PENDING","FAILED"]},attempts:{lt:MAX_DELIVERY_ATTEMPTS},available_at:{lte:now}},data:{status:"CLAIMED",claimed_at:now}});if(claimed.count!==1)continue;
    try{await webpush.sendNotification({endpoint:delivery.subscription.endpoint,keys:{p256dh:delivery.subscription.p256dh,auth:delivery.subscription.auth}},JSON.stringify(notificationPayload(delivery.task)),{TTL:3600});await prisma.notificationDelivery.update({where:{id:delivery.id},data:{status:"SENT",sent_at:new Date(),attempts:{increment:1},last_error:null}});sent+=1;}
    catch(reason){const statusCode=typeof reason==="object"&&reason&&"statusCode" in reason?Number((reason as {statusCode:unknown}).statusCode):0;const message=reason instanceof Error?reason.message:String(reason);if(statusCode===404||statusCode===410){await prisma.pushSubscription.delete({where:{id:delivery.subscription_id}}).catch(()=>undefined);}else{const nextAttempt=delivery.attempts+1;await prisma.notificationDelivery.update({where:{id:delivery.id},data:{status:"FAILED",attempts:{increment:1},claimed_at:null,last_error:message.slice(0,1000),available_at:new Date(now.getTime()+deliveryBackoffMs(nextAttempt))}});}failed+=1;logger.warn(`Push delivery ${delivery.id} failed: ${message}`);}
  }
  return {claimed:candidates.length,sent,failed};
}

export async function runNotificationDispatcher(now=new Date()){const enqueued=await enqueueDueNotifications(now);const result=await dispatchDueNotifications(now);logger.info(`Notification dispatcher enqueued=${enqueued} sent=${result.sent} failed=${result.failed}`);return {enqueued,...result};}
