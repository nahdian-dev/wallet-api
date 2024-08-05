const express = require("express");
const mainRoute = require("./main.route");

// Instance
const router = express.Router();

const routes = [
    {
        path: "/",
        route: mainRoute,
    }
];

routes.forEach(({ path, route }) => {
    router.use(path, route);
});

module.exports = router;