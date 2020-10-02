const router = require("express").Router();

const { getUserNotif, CountUnreadNotif } = require("../controller/notification");
const { authorization } = require("../middleware/auth");

router.get("/:id", authorization, getUserNotif)
router.get("/count-unread/:id", authorization, CountUnreadNotif)

module.exports = router;