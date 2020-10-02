const router = require("express").Router();

const { postTransfer } = require("../controller/transfer");
const { authorization } = require("../middleware/auth");

router.post("/", authorization, postTransfer)

module.exports = router;