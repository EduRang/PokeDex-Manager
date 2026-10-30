import { Router } from "express";
import {
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireTrustedOrigin } from "../middlewares/requireTrustedOrigin.js";

const router = Router();

router.use(requireTrustedOrigin);

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
