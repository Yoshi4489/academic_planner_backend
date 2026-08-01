import { Router } from "express";
import { authMiddleware } from "../middleware/middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  guestCommitSchema,
  guestSnapshotSchema,
} from "../utils/data-transfer.validator.js";
import {
  handleExport,
  handleImportCommit,
  handleImportPreview,
} from "../controllers/data-transfer.controller.js";

const router = Router();
router.use(authMiddleware);
router.get("/export", handleExport);
router.post("/guest-import/preview", validate(guestSnapshotSchema), handleImportPreview);
router.post("/guest-import/commit", validate(guestCommitSchema), handleImportCommit);

export default router;
