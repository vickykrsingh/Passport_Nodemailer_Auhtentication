const express = require("express");
const {login,logout,register,verifyEmail, checkGoogleUserData, forgotPassword, resetPassword} = require('../controllers/authController.js')
const { checkAuth } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post("/login", login);
router.post("/logout",logout);
router.post("/register",register);
router.get('/verify-email',verifyEmail); 
router.post("/test",checkAuth,(req,res)=>res.status(200).json({
    success:true,
    message:"accessed"
}))
router.get("/google-user-data",checkAuth,checkGoogleUserData)
// Forgot Password
router.post('/forgot-password',forgotPassword);

// Reset Password
router.post('/reset-password',resetPassword);

module.exports = router;
