const routes = require("express").Router()

const users = require("./routes/users");
const payment = require("./routes/payment")
routes.use("/users", users);
routes.use("/payment", payment);

module.exports = routes