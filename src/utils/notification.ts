export const MAX_REMINDER_MINUTES=43_200;
export const MAX_DELIVERY_ATTEMPTS=3;

export function notificationScheduledFor(dueAt:Date,offsetMinutes:number){return new Date(dueAt.getTime()-offsetMinutes*60_000);}
export function deliveryBackoffMs(attempt:number){return Math.min(60,2**Math.max(0,attempt-1)*5)*60_000;}
export function notificationPayload(task:{id:string;title:string;type:string;due_at:Date;course:{name:string;course_code:string|null}}){return {title:task.title,body:`${task.course.course_code?`${task.course.course_code} · `:""}${task.course.name}`,icon:"/icon-192.png",badge:"/icon-192.png",tag:`academic-task-${task.id}`,data:{url:"/th/planner",task_id:task.id,type:task.type,due_at:task.due_at.toISOString()}};}
