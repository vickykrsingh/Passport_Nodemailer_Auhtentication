const app = require("./api/index");

// Load secrets and start server
// TODO: Uncomment this block when access to AWS is restored
// secretsLoader().then(() => {
//     // Middleware
//     app.use(cors(corsOptions));
//     app.use(errorHandler);
//     app.use(express.json());
//     // TODO: Uncomment this line when validateApiKey is implemented
//     // app.use(validateApiKey);
//     app.use(routes);

//     // Listener
//     const port = process.env.PORT || 4000;
//     const host = 'localhost';
    
//     app.listen(port, host, () => {
//         console.log(`Server is running on port http://${host}:${port}`);
//     });
// }).catch(err => {
//     console.error("Failed to start server due to error in loading secrets:", err);
// });

// Listener
const port = process.env.PORT || 4000;
const host = 'localhost';
app.listen(port, host, () => {
    console.log(`Server is running on port http://${host}:${port}`);
});
