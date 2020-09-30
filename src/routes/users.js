const router = require("express").Router();

const {
    getAllUser,
    getUserById,
    loginUser,
    registerUser,
    activationEmail,
    activationUser,
    forgotPassword,
    changePassword

} = require("../controller/users");
const { authorization, authorization2 } = require("../middleware/auth");

router.get("/user/", authorization2, getAllUser);
router.get('/:id', authorization, getUserById)

router.post("/login", loginUser);
router.post("/register", registerUser);

router.post('/email', activationEmail)
router.patch('/activate', activationUser)

router.post('/forgot', forgotPassword)
router.patch('/change', changePassword)

module.exports = router;