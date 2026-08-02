import {Router} from "express";
import {authMiddleware} from "../middleware/middleware.js";
import {validate} from "../middleware/validate.middleware.js";
import {handleRemoveSubscription,handleSaveSubscription,handleVapidPublicKey} from "../controllers/notification.controller.js";
import {pushSubscriptionSchema} from "../utils/notification.validator.js";

const router=Router();
router.use(authMiddleware);
router.get("/vapid-public-key",handleVapidPublicKey);
router.post("/subscriptions",validate(pushSubscriptionSchema),handleSaveSubscription);
router.delete("/subscriptions/:id",handleRemoveSubscription);
export default router;
