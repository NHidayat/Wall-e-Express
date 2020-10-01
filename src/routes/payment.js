const router = require("express").Router();

const { postPayment, postManualPayment } = require("../controller/payment");

router.post("/", postPayment);
router.post("/top-up", postManualPayment);

module.exports = router;
