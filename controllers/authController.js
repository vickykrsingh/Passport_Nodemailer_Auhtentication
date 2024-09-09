const poolDB = require('../config/db.js')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const sendMail = require('../config/sendEmail.js')
const crypto = require('crypto')

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(200).json({
                success: false,
                message: "Email and Password are required."
            });
        }

        const query = 'SELECT * FROM bayavasfdc.users WHERE email = $1';
        const result = await poolDB.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: "User not found."
            });
        }

        const user = result.rows[0];
        if (!user.is_verified) {
            // Resend verification email if not verified
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const verificationTokenHash = await bcryptjs.hash(verificationToken, 8);
            const updateQuery = 'UPDATE bayavasfdc.users SET verification_token = $1 WHERE email = $2';
            await poolDB.query(updateQuery, [verificationTokenHash, email]);

            const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}&email=${email}`;
            await sendMail({
                to: email,
                subject: "Email Verification",
                text: `Please verify your email by clicking the link: ${verificationLink}`
            });

            return res.status(200).json({
                success: false,
                message: "Please verify your email. A verification link has been sent to your email."
            });
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(200).json({
                success: false,
                message: "Invalid password."
            });
        }

        const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET);
        res.cookie('token', token, {
            maxAge: 3600000,
            httpOnly: true,
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: error.message
        });
    }
};


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(200).json({
                success: false,
                message: "Name, Email, and Password are required."
            });
        }

        const checkUserQuery = 'SELECT * FROM bayavasfdc.users WHERE email = $1';
        const checkUserResult = await poolDB.query(checkUserQuery, [email]);

        if (checkUserResult.rows.length > 0) {
            return res.status(200).json({
                success: false,
                message: "User already exists."
            });
        }

        const hashedPassword = await bcryptjs.hash(password, 8);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenHash = await bcryptjs.hash(verificationToken, 8);

        const insertUserQuery = `
            INSERT INTO bayavasfdc.users (name, email, password, verification_token, is_verified)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, email
        `;
        const newUserResult = await poolDB.query(insertUserQuery, [name, email, hashedPassword, verificationTokenHash, false]);

        const newUser = newUserResult.rows[0];

        // Send verification email
        const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?token=${verificationToken}&email=${email}`;
        await sendMail({
            to: email,
            subject: "Email Verification",
            text: `Please verify your email by clicking the link: ${verificationLink}`
        });

        return res.status(200).json({
            success: true,
            message: "User registered successfully. Please check your email to verify your account.",
            user: newUser
        });

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: error.message
        });
    }
};


 exports.logout = async (req, res) => {
    try {
        res.cookie('token', '', {
            expires: new Date(0),
            httpOnly: true,
            secure: true,
        });
        return res.status(200).json({
            success: true,
            message: "Logout successfully."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


exports.verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;
        const query = 'SELECT * FROM bayavasfdc.users WHERE email = $1';
        const result = await poolDB.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: false,
                message: "Invalid token or email."
            });
        }

        const user = result.rows[0];
        const isTokenValid = await bcryptjs.compare(token, user.verification_token);

        if (!isTokenValid) {
            return res.status(200).json({
                success: false,
                message: "Invalid or expired token."
            });
        }

        // Mark the user as verified
        const updateQuery = 'UPDATE bayavasfdc.users SET is_verified = true, verification_token = null WHERE email = $1';
        await poolDB.query(updateQuery, [email]);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in."
        });

    } catch (error) {
        return res.status(200).json({
            success: false,
            message: error.message
        });
    }
};

exports.checkGoogleUserData = async (req,res) => {
    return res.status(200).json({
        success:true,
        user:req.user
    })
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email,origin } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.',
            });
        }

        const query = 'SELECT * FROM bayavasfdc.users WHERE email = $1';
        const result = await poolDB.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'If that email address is in our database, we will send you an email to reset your password.',
            });
        }

        const user = result.rows[0];

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = await bcryptjs.hash(resetToken, 8);
        const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour expiration

        // Update user with reset token and expiration
        const updateQuery = 'UPDATE bayavasfdc.users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3';
        await poolDB.query(updateQuery, [resetTokenHash, resetTokenExpires, email]);

        // Send password reset email
        const resetLink = `${origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
        await sendMail({
            to: email,
            subject: 'Password Reset',
            text: `You requested a password reset. Please click the link to reset your password: ${resetLink}`,
        });

        return res.status(200).json({
            success: true,
            message: 'If that email address is in our database, we will send you an email to reset your password.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { token, email, password } = req.body;

        if (!token || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token, email, and new password are required.',
            });
        }

        const query = 'SELECT * FROM bayavasfdc.users WHERE email = $1';
        const result = await poolDB.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token or email.',
            });
        }

        const user = result.rows[0];

        // Check if token is valid and not expired
        const isTokenValid = await bcryptjs.compare(token, user.reset_password_token);
        const isTokenExpired = new Date() > user.reset_password_expires;

        if (!isTokenValid || isTokenExpired) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token.',
            });
        }

        // Hash the new password
        const hashedPassword = await bcryptjs.hash(password, 8);

        // Update user's password and remove reset token
        const updateQuery = 'UPDATE bayavasfdc.users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE email = $2';
        await poolDB.query(updateQuery, [hashedPassword, email]);

        return res.status(200).json({
            success: true,
            message: 'Your password has been reset successfully.',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
};
