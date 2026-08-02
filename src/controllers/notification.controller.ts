import type {NextFunction,Request,Response} from "express";
import createHttpError from "http-errors";
import {removePushSubscription,savePushSubscription,vapidPublicKey} from "../services/notification.service.js";

const userId=(req:Request)=>{if(!req.user)throw createHttpError.Unauthorized();return req.user.user_id;};
export const handleVapidPublicKey=(req:Request,res:Response,next:NextFunction)=>{try{userId(req);res.status(200).json({public_key:vapidPublicKey()});}catch(error){next(error);}};
export const handleSaveSubscription=async(req:Request,res:Response,next:NextFunction)=>{try{const subscription=await savePushSubscription(userId(req),req.body,req.get("user-agent"));res.status(201).json({data:subscription});}catch(error){next(error);}};
export const handleRemoveSubscription=async(req:Request,res:Response,next:NextFunction)=>{try{const id=req.params.id;if(!id||Array.isArray(id))throw createHttpError.BadRequest("Invalid subscription id");await removePushSubscription(userId(req),id);res.status(204).send();}catch(error){next(error);}};
