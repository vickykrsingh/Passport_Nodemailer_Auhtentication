const allowedOrigins = JSON.parse(process.env.CLIENT_URLS);

const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

module.exports = corsOptions;
