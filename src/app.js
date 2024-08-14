const express = require("express");
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express');

const routes = require("./routes");
const { errorHandler } = require("./middlewares/error_handler.middleware");
const connectDB = require('./config/mongo.config');
const specs = require('./swagger');

// Instance
const app = express();

//CONNECT DB
connectDB();

// Body Parser
app.use(bodyParser.json());

// Set viewengine ejs
app.set('view engine', 'ejs');

// Routes
app.use("/", routes);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error Handling route not found
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.statusCode = 404;
    next(error);
});
app.use(errorHandler);

module.exports = app;