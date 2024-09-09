const AWS = require('aws-sdk');

const secretsManager = new AWS.SecretsManager({
    region: 'ap-south-1'
});

const secretsLoader = async () => {
    try {
        const data = await secretsManager.getSecretValue({ SecretId: 'bayava/server/env' }).promise();

        if ('SecretString' in data) {
            const envVars = JSON.parse(data.SecretString);
            process.env.PORT = envVars.PORT;
            // TODO: Uncomment this line when CLIENT_URL is added to the secret
            // process.env.CLIENT_URL = envVars.CLIENT_URL;
            // TODO: Uncomment this when API Key functionality is implemented
            // process.env.API_KEY = envVars.API_KEY;

            console.log("Secrets loaded successfully.");
            
        } else {
            throw new Error("SecretString is missing in the retrieved secret.");
        }
        
    } catch (err) {
        console.error("Error loading secrets from AWS Secrets Manager:", err);
        throw err;
    }
};

module.exports = secretsLoader;
