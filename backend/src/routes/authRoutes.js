const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.get("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.get("/me", requireAuth, authController.me);
router.get("/:provider/callback", authController.socialCallback);
router.get("/:provider", authController.beginSocialAuth);

module.exports = router;
