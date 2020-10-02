const router = require("express").Router();

const { postTransfer, getUserTransfer } = require("../controller/transfer");
const { authorization } = require("../middleware/auth");

router.get("/:id", authorization, getUserTransfer)
router.post("/", authorization, postTransfer)

module.exports = router;