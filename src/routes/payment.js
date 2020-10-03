const router = require("express").Router();

const { postPayment, postManualPayment } = require("../controller/payment");
const { authorization } = require("../middleware/auth");

router.post("/", authorization, postPayment);
router.post("/top-up", authorization, postManualPayment);

module.exports = router;
