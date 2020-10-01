const router = require("express").Router();

const { postPayment } = require("../controller/payment");

router.post("/", postPayment);

module.exports = router;
