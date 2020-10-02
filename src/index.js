const routes = require("express").Router()

const users = require("./routes/users");
const payment = require("./routes/payment")
const transfer = require("./routes/transfer")
routes.use("/users", users);
routes.use("/payment", payment);
routes.use("/transfer", transfer);

module.exports = routes