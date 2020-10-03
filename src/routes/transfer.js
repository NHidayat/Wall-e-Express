const router = require("express").Router();

const { postTransfer, getUserTransfer, getBalanceStatistic } = require("../controller/transfer");
const { authorization } = require("../middleware/auth");

router.get("/:id", authorization, getUserTransfer)
router.get("/balance-statistic/:id", authorization, getBalanceStatistic)
router.post("/", authorization, postTransfer)

module.exports = router;