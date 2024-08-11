const swaggerJsdoc = require('swagger-jsdoc');
require('./routes/main.route');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Wallet API',
            version: '1.0.0',
            description: 'A simple API for finance management'
        },
        servers: [
            {
                url: 'http://localhost:8000',
                description: 'Local server'
            }
        ]
    },
    apis: ['/routes/main.route.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
