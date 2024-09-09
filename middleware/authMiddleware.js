const jwt = require('jsonwebtoken')
exports.checkAuth = async (req, res, next) => {
    try {
        const token = await req.cookies.token;

        if (!token) {
            return res.status(200).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token."
        });
    }
};
