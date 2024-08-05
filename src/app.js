const express = require("express");
const bodyParser = require('body-parser')

const routes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error_handler.middleware");
const CustomApiError = require("./utilities/CustomApiError");

const connectDB = require('./config/mongo_config')

// Instance
const app = express();

//CONNECT DB
connectDB();

// Body Parser
app.use(bodyParser.json());

// Routes
app.use("/", routes);

// Error Handling
app.use((req, res, next) => {
    next(new CustomApiError(404, "Not found"));
});
app.use(errorConverter);
app.use(errorHandler);


module.exports = app;