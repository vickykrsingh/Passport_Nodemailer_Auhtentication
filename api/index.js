// IMPORT Environment Variables
const dontenv = require("dotenv");
dontenv.config();

// DEPENDENCIES
const express = require("express");
const cors = require("cors");
const corsOptions = require("../middleware/corsOptions")
const cookieParser = require("cookie-parser")
require('../config/passport.js')
// IMPORTS
// const secretsLoader = require("./config/secretsLoader"); // TODO: Uncomment this line when access to AWS is restored
// const corsOptions = require("../middleware/corsOptions");
const router = require("../routes/router");
// const validateApiKey = require("./middleware/validateApiKey"); // TODO: Uncomment this line when validateApiKey is implemented
const errorHandler = require("../middleware/error");
const session = require('express-session');
const passport = require('passport');
const app = express()

app.use(session({ secret: 'BayavaServer', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// CONFIGURATION

// MIDDLEWARE
app.use(cors(corsOptions));
app.use(cookieParser())
app.use(errorHandler);
app.use(express.json());
// app.use(validateApiKey); // TODO: Uncomment this line when validateApiKey is implemented
app.use(router);

app.use('/',(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Server is responding..."
    })
})

module.exports = app;
