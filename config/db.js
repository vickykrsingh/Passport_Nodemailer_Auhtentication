const {Pool} = require("pg")

// TODO: Remove the DATABASE_URL from .env and instead use the one being fetched from AWS Secrets Manager
const dotenv = require("dotenv");
dotenv.config();
const DB_URI = process.env.DATABASE_URL;

const poolDB = new Pool({
    connectionString: DB_URI,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = poolDB;