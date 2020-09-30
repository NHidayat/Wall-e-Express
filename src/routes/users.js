const router = require("express").Router();

const {
    getAllUser,
    registerUser,
    activationEmail,
    activationUser,
    forgotPassword,
    changePassword

} = require("../controller/users");

router.get("/user/", getAllUser);

router.post("/register", registerUser);

router.post('/email', activationEmail)
router.patch('/activate', activationUser)

router.post('/forgot', forgotPassword)
router.patch('/change', changePassword)

module.exports = router;