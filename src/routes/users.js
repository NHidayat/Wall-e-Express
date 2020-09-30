const router = require("express").Router();

const {
    getAllUser
} = require("../controller/users");

router.get("/user/", getAllUser);

module.exports = router;