const express = require("express");

const courseRoutes = require("./courseRoutes");
const teacherRoutes = require("./teacherRoutes");
const healerRoutes = require("./healerRoutes");
const cattleRoutes = require("./cattleRoutes");
const productRoutes = require("./productRoutes")
const authRoute = require("./authRoutes.js")
const passport = require('passport');
const jwt = require('jsonwebtoken')


const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({ msg: "Connection Successful" });
});


// Google OAuth login route
router.get('/auth/google', (req, res, next) => {
  // Capture the state from the request query (or use '/' as fallback)
  const state = req.query.state || '/';

  // Pass the state as a parameter to the passport.authenticate middleware
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state: state,
  })(req, res, next);  // Call passport.authenticate with req, res, and next
});

// Google OAuth callback route
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  (req, res) => {
    // Generate JWT after successful login via Google
    const token = jwt.sign(
      { _id: req.user.id, name: req.user.name, email: req.user.email, google_id: req.user.google_id },
      process.env.JWT_SECRET
    );
    res.cookie('token', token, {
      maxAge: 3600000, // 1 hour
      httpOnly: true,
    });

    // Retrieve the original URL from the state parameter
    const redirectUrl = req.query.state ? decodeURIComponent(req.query.state) : '/';

    // Redirect the user to the original URL they came from
    return res.redirect(redirectUrl);
  }
);


router.use("/api/courses", courseRoutes);
router.use("/api/teachers", teacherRoutes);
router.use("/api/healers", healerRoutes);
router.use("/api/products", productRoutes);
router.use("/api/cattle", cattleRoutes);
router.use("/api/auth", authRoute);


module.exports = router;
