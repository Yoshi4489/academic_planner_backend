import assert from "node:assert/strict";
import test from "node:test";
import {deliveryBackoffMs,notificationPayload,notificationScheduledFor} from "../src/utils/notification.js";
import {pushSubscriptionSchema} from "../src/utils/notification.validator.js";

test("notification schedule subtracts reminder offset",()=>{assert.equal(notificationScheduledFor(new Date("2026-08-02T10:00:00.000Z"),60).toISOString(),"2026-08-02T09:00:00.000Z");});
test("delivery retry backoff is bounded",()=>{assert.equal(deliveryBackoffMs(1),300_000);assert.equal(deliveryBackoffMs(10),3_600_000);});
test("push payload deep links to planner without sensitive fields",()=>{const payload=notificationPayload({id:"task",title:"Final exam",type:"EXAM",due_at:new Date("2026-08-02T10:00:00.000Z"),course:{name:"Calculus",course_code:"MA101"}});assert.equal(payload.data.url,"/th/planner");assert.equal(payload.body,"MA101 · Calculus");assert.equal("endpoint" in payload,false);});
test("subscription validator requires browser keys",()=>{assert.equal(pushSubscriptionSchema.safeParse({endpoint:"https://push.example/sub",keys:{p256dh:"x".repeat(30),auth:"a".repeat(12)}}).success,true);assert.equal(pushSubscriptionSchema.safeParse({endpoint:"https://push.example/sub",keys:{p256dh:"short",auth:"short"}}).success,false);});
