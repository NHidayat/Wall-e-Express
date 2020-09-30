const bcrypt = require("bcrypt");
const helper = require("../helper/index");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const {
    getAllUser,
    isUserExist,
    postUser,
    checkUser,
    checkKey,
    updating

} = require("../model/users");

module.exports = {
    getAllUser: async (request, response) => {
        try {
            const result = await getAllUser();
            return helper.response(response, 200, "Success Get All User", result);
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error);
        }
    },
    //======================================Register================================================
    registerUser: async (request, response) => {
        try {
            const { user_email, user_password, user_first_name, user_last_name, user_phone } = request.body;
            const userInDatabase = await isUserExist(user_email);
            if (userInDatabase.length > 0) {
                return helper.response(
                    response,
                    400,
                    "Email Has Already Been Taken"
                );
            } else {
                const atps = user_email.indexOf("@");
                const dots = user_email.lastIndexOf(".");
                if (
                    request.body.user_email === undefined ||
                    request.body.user_email === null ||
                    request.body.user_email === ""
                ) {
                    return helper.response(response, 404, "Email must be filled");
                } else if (atps < 1 || dots < atps + 2 || dots + 2 > user_email.length) {
                    return helper.response(response, 400, "Email is not Valid");
                } else if (
                    request.body.user_password === undefined ||
                    request.body.user_password === null ||
                    request.body.user_password === ""
                ) {
                    return helper.response(response, 404, "Password must be filled");
                } else if (
                    !user_password.match(/[A-Z]/g) ||
                    !user_password.match(/[0-9]/g) ||
                    user_password.length < 8 ||
                    user_password.length > 16
                ) {
                    return helper.response(
                        response,
                        400,
                        "Password Must include 8-16 characters, at least 1 digit number and 1 Uppercase"
                    );
                } else if (request.body.confirm_password !== request.body.user_password) {
                    return helper.response(response, 400, "Password didn't match")
                } else if (
                    request.body.user_first_name === undefined ||
                    request.body.user_first_name === null ||
                    request.body.user_first_name === ""
                ) {
                    return helper.response(response, 404, "First Name must be filled");
                } else if (
                    request.body.user_last_name === undefined ||
                    request.body.user_last_name === null ||
                    request.body.user_last_name === ""
                ) {
                    return helper.response(response, 404, "Last Name must be filled");
                } else if (
                    request.body.user_phone === undefined ||
                    request.body.user_phone === null ||
                    request.body.user_phone === ""
                ) {
                    return helper.response(response, 404, "Phone Number must be filled");
                } else if (
                    request.body.user_phone.length < 8 ||
                    request.body.user_phone.length > 16
                ) {
                    return helper.response(response, 404, "Invalid Phone Number");
                } else {
                    const salt = bcrypt.genSaltSync(10);
                    const encryptPassword = bcrypt.hashSync(user_password, salt);
                    const setData = {
                        user_email: user_email,
                        user_first_name: user_first_name,
                        user_last_name: user_last_name,
                        user_password: encryptPassword,
                        user_phone: user_phone,
                        user_picture: 'blank.jpg',
                        user_pin: '',
                        user_role: 2,
                        user_status: 0,
                        user_created_at: new Date()
                    }
                    const result = await postUser(setData);
                    return helper.response(
                        response,
                        200,
                        "Success Register User",
                        result
                    );

                }
            }

        } catch (error) {
            return helper.response(response, 400, "Bad Request");
        }
    },
    //===================================================================================================
    //===========================================Activation User=========================================
    activationEmail: async (request, response) => {
        try {
            const { user_email } = request.body;
            const keys = Math.round(Math.random() * 100000);
            const checkDataUser = await checkUser(user_email);
            if (checkDataUser.length >= 1) {
                const data = {
                    user_key: keys,
                    user_updated_at: new Date()
                }
                await updating(data, user_email)
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASS
                    }
                })
                await transporter.sendMail({
                    from: '"Wall-E"',
                    to: user_email,
                    subject: "Wall-E - Activation Email",
                    html: `<a href="http://localhost:8080/activate?keys=${keys}">Click Here To Activate Your Account</a>`,
                }),
                    function (error) {
                        if (error) {
                            return helper.response(response, 400, 'Email not sent !')
                        }
                    }
                return helper.response(response, 200, 'Email has been sent !')
            } else {
                return helper.response(response, 400, 'Email is not registered !')
            }
        } catch (error) {
            return helper.response(response, 400, 'Bad Request', error)
        }
    },
    activationUser: async (request, response) => {
        try {
            const { keys } = request.query;
            const checkDataKey = await checkKey(keys);
            if (
                request.query.keys === undefined ||
                request.query.keys === null ||
                request.query.keys === ""
            ) {
                return helper.response(response, 400, "Invalid Key");
            }
            if (checkDataKey.length > 0) {
                const email = checkDataKey[0].user_email
                const setData = {
                    user_key: '',
                    user_status: 1,
                    user_updated_at: new Date(),
                };
                const difference =
                    setData.user_updated_at - checkDataKey[0].user_updated_at
                const minutesDifference = Math.floor(difference / 1000 / 60)
                if (minutesDifference > 15) {
                    const data = {
                        user_key: "",
                        user_updated_at: new Date(),
                    };
                    await updating(data, email);
                    return helper.response(response, 400, "Key has expired")
                } else {
                    const result = await updating(setData, email);
                    return helper.response(response, 200, "Success Activate Account", result);
                }
            } else {
                return helper.response(response, 400, `Invalid key`);
            }
        } catch (error) {
            return helper.response(response, 404, "Bad Request", error)
        }
    },
    //======================================================================================
    //==================================Login============================================
    loginUser: async (request, response) => {
        if (
            request.body.user_email === undefined ||
            request.body.user_email === null ||
            request.body.user_email === ""
        ) {
            return helper.response(response, 404, "Email must be filled");
        } else if (
            request.body.user_password === undefined ||
            request.body.user_password === null ||
            request.body.user_password === ""
        ) {
            return helper.response(response, 404, "Password must be filled");
        }
        try {
            const { user_email, user_password } = request.body;
            const checkDataUser = await checkUser(user_email);
            if (checkDataUser.length >= 1) {
                const checkPassword = bcrypt.compareSync(
                    user_password,
                    checkDataUser[0].user_password
                );
                if (checkPassword) {
                    const {
                        user_id,
                        user_email,
                        user_first_name,
                        user_last_name,
                        user_role,
                        user_status,
                    } = checkDataUser[0];
                    let payload = {
                        user_id,
                        user_email,
                        user_first_name,
                        user_last_name,
                        user_role,
                        user_status,
                    };
                    if (user_status == 0) {
                        return helper.response(
                            response,
                            400,
                            "Your Account is not Active"
                        );
                    } else {
                        const token = jwt.sign(payload, "RAHASIA", { expiresIn: "2h" });
                        // const refreshToken = jwt.sign(payload, "RAHASIA", {
                        //     expiresIn: "48h",
                        // })
                        // refreshTokens[refreshToken] = user_id
                        // console.log(refreshTokens)
                        // payload = { ...payload, token, refreshToken }
                        payload = { ...payload, token };
                        return helper.response(response, 200, "Success Login", payload);
                    }
                } else {
                    return helper.response(response, 400, "Wrong Password !");
                }
            } else {
                return helper.response(response, 400, "Email is not Registered !");
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request");
        }
    },
    //================================================================================================
    //==========================================Forgot Password===================================================
    forgotPassword: async (request, response) => {
        try {
            const { user_email } = request.body
            const keys = Math.round(Math.random() * 100000)
            const checkDataUser = await checkUser(user_email)
            if (checkDataUser.length >= 1) {
                const data = {
                    user_key: keys,
                    user_updated_at: new Date(),
                };
                await updating(data, user_email);
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASS,
                    },
                })
                await transporter.sendMail({
                    from: '"EchteTalk"',
                    to: user_email,
                    subject: "EchteTalk - Forgot Password",
                    html: `<a href="http://localhost:8080/setpassword?keys=${keys}">Click Here To Change Password</a>`,
                }),
                    function (error) {
                        if (error) {
                            return helper.response(response, 400, "Email not sent !")
                        }
                    };
                return helper.response(response, 200, "Email has been sent !")
            } else {
                return helper.response(response, 400, 'Email is not registered !')
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
    changePassword: async (request, response) => {
        try {
            const { keys } = request.query
            const { user_password } = request.body
            const checkDataUser = await checkKey(keys)
            if (
                request.query.keys === undefined ||
                request.query.keys === null ||
                request.query.keys === ""
            ) {
                return helper.response(response, 400, "Invalid Key");
            }
            if (checkDataUser.length > 0) {
                const email = checkDataUser[0].user_email
                const setData = {
                    user_key: keys,
                    user_password,
                    user_updated_at: new Date(),
                }
                const difference =
                    setData.user_updated_at - checkDataUser[0].user_updated_at
                const minutesDifference = Math.floor(difference / 1000 / 60)
                if (minutesDifference > 5) {
                    const data = {
                        user_key: "",
                        user_updated_at: new Date(),
                    };
                    await updating(data, email);
                    return helper.response(response, 400, "Key has expired")
                } else if (
                    request.body.user_password === undefined ||
                    request.body.user_password === null ||
                    request.body.user_password === ""
                ) {
                    return helper.response(response, 400, "Password must be filled !")
                } else if (
                    request.body.confirm_password === undefined ||
                    request.body.confirm_password === null ||
                    request.body.confirm_password === ""
                ) {
                    return helper.response(
                        response,
                        400,
                        "Confirm Password must be filled !"
                    )
                } else if (
                    !request.body.user_password.match(/[A-Z]/g) ||
                    !request.body.user_password.match(/[0-9]/g) ||
                    request.body.user_password.length < 8 ||
                    request.body.user_password.length > 16
                ) {
                    return helper.response(response, 400, "Password Must include 8-16 characters, at least 1 digit number and 1 Uppercase")
                } else if (request.body.confirm_password !== request.body.user_password) {
                    return helper.response(response, 400, "Password didn't match");
                } else {
                    const salt = bcrypt.genSaltSync(10);
                    const encryptPassword = bcrypt.hashSync(user_password, salt)
                    setData.user_password = encryptPassword
                    setData.user_key = ""
                }
                const result = await updating(setData, email)
                return helper.response(
                    response,
                    200,
                    "Success Password Updated",
                    result
                );
            } else {
                return helper.response(response, 404, `Invalid key`);
            }
        } catch (error) {
            return helper.response(response, 404, "Bad Request", error);
        }
    },
}
