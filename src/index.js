const config = require("./config/env.config");
const app = require("./app");

if (config.value.NODE_ENV !== "test") {
    app.listen(config.value.PORT, () => {
        console.info(`Server are listening on port: ${config.value.PORT}`);
    });
}

process
    .on("unhandledRejection", (reason, p) => {
        console.error(reason, "Unhandled Rejection at Promise", p);
    })
    .on("uncaughtException", (error) => {
        console.error(error, "Uncaught Exception thrown");
        process.exit(1);
    });