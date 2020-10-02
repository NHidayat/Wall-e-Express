const routes = require("express").Router();

const users = require("./routes/users");
const payment = require("./routes/payment")
const transfer = require("./routes/transfer")
const notification = require("./routes/notification")
routes.use("/users", users);
routes.use("/payment", payment);
routes.use("/transfer", transfer);
routes.use("/notification", notification);

module.exports = routes;
