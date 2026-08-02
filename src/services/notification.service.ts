import createHttpError from "http-errors";
import prisma from "../config/prisma.js";
import {env} from "../config/env.js";
import type {PushSubscriptionInput} from "../utils/notification.validator.js";

export const vapidPublicKey=()=>{if(!env.WEB_PUSH_VAPID_PUBLIC_KEY)throw createHttpError.ServiceUnavailable("Web push is not configured");return env.WEB_PUSH_VAPID_PUBLIC_KEY;};

export const savePushSubscription=(userId:string,input:PushSubscriptionInput,userAgent?:string)=>{
  vapidPublicKey();
  return prisma.pushSubscription.upsert({
    where:{endpoint:input.endpoint},
    create:{endpoint:input.endpoint,p256dh:input.keys.p256dh,auth:input.keys.auth,user_agent:userAgent??null,user_id:userId},
    update:{p256dh:input.keys.p256dh,auth:input.keys.auth,user_agent:userAgent??null,user_id:userId},
    select:{id:true,created_at:true,updated_at:true},
  });
};

export const removePushSubscription=async(userId:string,id:string)=>{
  const subscription=await prisma.pushSubscription.findFirst({where:{id,user_id:userId},select:{id:true}});
  if(!subscription)throw createHttpError.NotFound("Push subscription not found");
  await prisma.pushSubscription.delete({where:{id}});
};
