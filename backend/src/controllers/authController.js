const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const { sendVerificationEmail } = require("../services/emailService");
const { frontendUrl, apiUrl } = require("../config/urls");

const SOCIAL_PROVIDERS = new Set(["google", "facebook"]);
const STATE_COOKIE = "oauth_state";
const FACEBOOK_GRAPH_API_VERSION = process.env.FACEBOOK_GRAPH_API_VERSION || "v20.0";
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function newVerificationToken() {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
  };
}

function callbackUrl(provider) {
  const configured = process.env[`${provider.toUpperCase()}_CALLBACK_URL`];
  return configured || new URL(`/api/auth/${provider}/callback`, `${apiUrl()}/`).toString();
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part.trim(), ""] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1))];
  }).filter(([key]) => key));
}

function configured(provider) {
  return provider === "google"
    ? process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    : process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET;
}

function readOAuthSession(req) {
  const raw = parseCookies(req.headers.cookie)[STATE_COOKIE];
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return { state: raw, frontendOrigin: null };
  }
}

function socialErrorRedirect(res, message, frontendOrigin) {
  try {
    const url = new URL("/oauth/callback", frontendUrl(null, frontendOrigin));
    url.hash = new URLSearchParams({ error: message }).toString();
    return res.redirect(url.toString());
  } catch {
    return res.status(503).json({ error: "Social sign-in is not configured for this environment" });
  }
}

function beginSocialAuth(req, res) {
  const { provider } = req.params;
  if (!SOCIAL_PROVIDERS.has(provider)) return res.status(404).json({ error: "Unsupported social provider" });
  if (!configured(provider)) return res.status(503).json({ error: `${provider} sign-in is not configured` });

  let returnOrigin;
  try {
    returnOrigin = frontendUrl(req, req.query.frontend_origin);
  } catch {
    return res.status(503).json({ error: "Frontend URL is not configured for social sign-in" });
  }

  const state = crypto.randomBytes(32).toString("hex");
  const stateCookie = Buffer.from(JSON.stringify({ state, frontendOrigin: returnOrigin })).toString("base64url");
  res.cookie(STATE_COOKIE, stateCookie, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
    path: "/api/auth",
  });

  const params = new URLSearchParams({
    redirect_uri: callbackUrl(provider),
    response_type: "code",
    state,
  });
  if (provider === "google") {
    params.set("client_id", process.env.GOOGLE_CLIENT_ID);
    params.set("scope", "openid email profile");
    params.set("prompt", "select_account");
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }
  params.set("client_id", process.env.FACEBOOK_APP_ID);
  params.set("scope", "email,public_profile");
  return res.redirect(`https://www.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/dialog/oauth?${params}`);
}

async function fetchSocialProfile(provider, code) {
  const redirectUri = callbackUrl(provider);
  if (provider === "google") {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectUri, grant_type: "authorization_code" }),
    });
    const tokens = await tokenResponse.json();
    if (!tokenResponse.ok || !tokens.id_token) throw new Error("Google could not verify the authorization code");
    const { OAuth2Client } = require("google-auth-library");
    const ticket = await new OAuth2Client(process.env.GOOGLE_CLIENT_ID).verifyIdToken({ idToken: tokens.id_token, audience: process.env.GOOGLE_CLIENT_ID });
    const profile = ticket.getPayload();
    if (!profile.email || !profile.email_verified || !profile.sub) throw new Error("Google did not provide a verified email address");
    return { subject: profile.sub, email: profile.email, firstName: profile.given_name || "Member", lastName: profile.family_name || "" };
  }

  const tokenParams = new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID, client_secret: process.env.FACEBOOK_APP_SECRET, redirect_uri: redirectUri, code });
  const tokenResponse = await fetch(`https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/oauth/access_token?${tokenParams}`);
  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok || !tokens.access_token) throw new Error("Facebook could not verify the authorization code");
  const profileResponse = await fetch(`https://graph.facebook.com/${FACEBOOK_GRAPH_API_VERSION}/me?fields=id,email,first_name,last_name,name&access_token=${encodeURIComponent(tokens.access_token)}`);
  const profile = await profileResponse.json();
  if (!profileResponse.ok || !profile.id || !profile.email) throw new Error("Facebook did not provide an email address. Please use email sign-up instead.");
  const names = (profile.name || "Member").trim().split(/\s+/);
  return { subject: profile.id, email: profile.email, firstName: profile.first_name || names[0] || "Member", lastName: profile.last_name || names.slice(1).join(" ") };
}

async function socialCallback(req, res, next) {
  const { provider } = req.params;
  if (!SOCIAL_PROVIDERS.has(provider)) return res.status(404).json({ error: "Unsupported social provider" });
  const oauthSession = readOAuthSession(req);
  const returnOrigin = oauthSession?.frontendOrigin;
  if (req.query.error) return socialErrorRedirect(res, "Social sign-in was cancelled", returnOrigin);
  if (!req.query.code || !req.query.state || oauthSession?.state !== req.query.state) {
    return socialErrorRedirect(res, "Your sign-in session expired. Please try again.", returnOrigin);
  }
  res.clearCookie(STATE_COOKIE, { path: "/api/auth" });
  try {
    const profile = await fetchSocialProfile(provider, req.query.code);
    const result = await userModel.findOrCreateSocialUser({
      provider,
      providerSubject: profile.subject,
      email: profile.email.trim().toLowerCase(),
      firstName: profile.firstName.trim().slice(0, 100) || "Member",
      lastName: profile.lastName.trim().slice(0, 100),
    });
    const params = new URLSearchParams({ token: createAccessToken(result.user), user: Buffer.from(JSON.stringify(result.user)).toString("base64url"), merged: String(result.merged) });
    res.redirect(`${frontendUrl(null, returnOrigin)}/oauth/callback#${params}`);
  } catch (error) {
    console.error(`Social sign-in failed for ${provider}:`, error.message);
    socialErrorRedirect(res, "We could not verify that social account. Please try again.", returnOrigin);
  }
}

function createAccessToken(user) {
  return jwt.sign({ sub: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function signup(req, res, next) {
  const { firstName, lastName, email, password, address } = req.body;
  if (!firstName || !lastName || !email || !password || password.length < 8) {
    return res.status(400).json({ error: "First name, last name, email, and a password of at least 8 characters are required" });
  }

  const verification = newVerificationToken();
  try {
    const user = await userModel.createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: typeof address === "string" ? address.trim() || null : null,
      email: email.trim().toLowerCase(),
      passwordHash: await bcrypt.hash(password, 12),
      verificationToken: verification.token,
      verificationTokenExpiresAt: verification.expiresAt,
      isVerified: false,
    });
    const delivery = await sendVerificationEmail({ email: user.email, firstName: user.first_name, token: verification.token, frontendUrl: frontendUrl(req) });
    res.status(201).json({
      user,
      message: delivery.error
        ? "Account created, but we could not send the verification email. Please use the resend option on the sign-in page."
        : "Account created. Check your email to verify your account before signing in.",
      emailDeliveryFailed: Boolean(delivery.error),
      developmentVerificationUrl: delivery.error && process.env.NODE_ENV !== "production" ? delivery.verifyUrl : undefined,
    });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "Email is already registered" });
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
  try {
    const user = await userModel.findUserByEmail(email.trim().toLowerCase());
    if (!user || !user.password_hash || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.is_verified) {
      return res.status(403).json({
        error: "Please verify your email before signing in",
        isUnverified: true,
        email: user.email,
      });
    }
    delete user.password_hash;
    res.json({ user, token: createAccessToken(user) });
  } catch (error) {
    next(error);
  }
}

async function verifyEmail(req, res, next) {
  const token = req.query.token || req.body.token;

  if (!token) {
    return res.status(400).json({
      error: "Verification token is required"
    });
  }

  try {
    const user = await userModel.verifyUserEmail(token);

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired verification token"
      });
    }

    return res.json({
      message: "Email verified successfully",
      user
    });
  } catch (error) {
    next(error);
  }
}

async function resendVerification(req, res, next) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email address is required" });

  try {
    const user = await userModel.findUserByEmail(email.trim().toLowerCase());
    if (!user) {
      // Don't disclose user existence, return friendly message
      return res.json({ message: "If an account exists with this email, a verification link has been sent." });
    }
    if (user.is_verified) {
      return res.status(400).json({ error: "This email address is already verified. You can sign in directly." });
    }

    const verification = newVerificationToken();

    await userModel.setVerificationToken(user.id, verification.token, verification.expiresAt);

    const delivery = await sendVerificationEmail({
      email: user.email,
      firstName: user.first_name,
      token: verification.token,
      frontendUrl: frontendUrl(req),
    });

    if (delivery.error) {
      return res.status(503).json({
        error: "We could not send a verification email right now. Please try again shortly.",
        developmentVerificationUrl: process.env.NODE_ENV !== "production" ? delivery.verifyUrl : undefined,
      });
    }

    res.json({ message: "A fresh verification link has been sent to your email." });
  } catch (error) {
    next(error);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { signup, login, verifyEmail, resendVerification, me, beginSocialAuth, socialCallback };
