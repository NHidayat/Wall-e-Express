const multer = require("multer");
const helper = require("../helper/index");

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, "./uploads/");
    },
    filename: (request, file, callback) => {
        callback(
            null,
            new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
        );
    },
});
const fileFilter = (request, file, callback) => {
    if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg"
    ) {
        callback(null, true);
    } else {
        return callback(new Error("Only images files are allowed"), false);
    }
};
const limits = { fileSize: 1024 * 1024 };
let upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
}).single("user_picture");

const uploadFilter = (request, response, next) => {
    upload(request, response, function (error) {
        if (error instanceof multer.MulterError) {
            return helper.response(response, 400, error.message);
        } else if (error) {
            return helper.response(response, 400, error.message);
        }
        next();
    });
};

module.exports = uploadFilter;