const router = require("express").Router();

const {
    getAllUser,
    getUserByName,
    getUserById,
    patchPassword,
    patchProfile,
    patchImage,
    deleteImage,
    isPinExist,
    checkPin,
    patchPin,
    deactivateUser,
    loginUser,
    registerUser,
    activationEmail,
    activationUser,
    forgotPassword,
    changePassword

} = require("../controller/users");
const { authorization } = require("../middleware/auth");
const uploadImage = require("../middleware/multer");

router.get("/user", authorization, getAllUser);
router.get("/user/name", authorization, getUserByName);
router.get('/:id', authorization, getUserById)
router.patch("/patch/password/:user_id", authorization, patchPassword);
router.patch("/patch/profile/:user_id", authorization, patchProfile);
router.patch("/patch/image/:user_id", authorization, uploadImage, patchImage);
router.patch("/delete/image/:user_id", authorization, deleteImage);

router.get('/pin/exist/:user_id', authorization, isPinExist)
router.get('/pin/:user_id', authorization, checkPin)
router.patch("/patch/pin/:user_id", authorization, patchPin);

router.patch("/deactivate/:user_id", authorization, deactivateUser);

router.post("/login", loginUser);
router.post("/register", registerUser);

router.post('/email', activationEmail)
router.patch('/activate', activationUser)

router.post('/forgot', forgotPassword)
router.patch('/change', changePassword)

module.exports = router;