const express = require("express");
const bodyParser = require('body-parser')

const routes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error_handler.middleware");
const CustomApiError = require("./utilities/CustomApiError");

// Instance
const app = express();

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