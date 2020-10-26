const bcrypt = require("bcrypt");
const helper = require("../helper/index");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer")
const fs = require("fs");
const qs = require("querystring");
const {
    getAllUser,
    getUserByName,
    getUserCount,
    getUserCountByName,
    getUserById,
    getPasswordById,
    checkPin,
    patchUser,
    isUserExist,
    isPhoneExist,
    postUser,
    checkUser,
    checkKey,
    updating,
    isPhone_OtherUserExist
} = require("../model/users");

const getPrevLink = (page, currentQuery) => {
    if (page > 1) {
        const generatedPage = {
            page: page - 1,
        };
        const resultPrevLink = { ...currentQuery, ...generatedPage };
        return qs.stringify(resultPrevLink);
    } else {
        return null;
    }
};

const getNextLink = (page, totalPage, currentQuery) => {
    if (page < totalPage) {
        const generatedPage = {
            page: page + 1,
        };
        const resultNextLink = { ...currentQuery, ...generatedPage };
        return qs.stringify(resultNextLink);
    } else {
        return null;
    }
};
module.exports = {
    getAllUser: async (request, response) => {
        try {
            let { sort, page, limit } = request.query;

            if (sort === undefined || sort === null || sort === "") {
                sort = `user_id`;
            }
            if (page === undefined || page === null || page === "") {
                page = parseInt(1);
            } else {
                page = parseInt(page);
            }
            if (limit === undefined || limit === null || limit === "") {
                limit = parseInt(9);
            } else {
                limit = parseInt(limit);
            }
            let totalData = await getUserCount();
            let totalPage = Math.ceil(totalData / limit);
            let limits = page * limit;
            let offset = page * limit - limit;
            let prevLink = getPrevLink(page, request.query);
            let nextLink = getNextLink(page, totalPage, request.query);

            const pageInfo = {
                page,
                totalPage,
                limit,
                totalData,
                prevLink: prevLink && `http://127.0.0.1:3001/users/user?${prevLink}`,
                nextLink: nextLink && `http://127.0.0.1:3001/users/user?${nextLink}`,
            };
            const result = await getAllUser(sort, limit, offset);
            return helper.response(response, 200, "Success Get All User", result, pageInfo);
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error);
        }
    },
    getUserByName: async (request, response) => {
        try {
            let { search, page, limit } = request.query;

            if (search === undefined || search === null || search === "") {
                search = "%";
            }
            if (page === undefined || page === null || page === "") {
                page = parseInt(1);
            } else {
                page = parseInt(page);
            }
            if (limit === undefined || limit === null || limit === "") {
                limit = parseInt(9);
            } else {
                limit = parseInt(limit);
            }
            let totalData = await getUserCountByName(search);
            let totalPage = Math.ceil(totalData / limit);
            let limits = page * limit;
            let offset = page * limit - limit;
            let prevLink = getPrevLink(page, request.query);
            let nextLink = getNextLink(page, totalPage, request.query);

            const pageInfo = {
                page,
                totalPage,
                limit,
                totalData,
                prevLink: prevLink && `http://127.0.0.1:3001/users/user/name?${prevLink}`,
                nextLink: nextLink && `http://127.0.0.1:3001/users/user/name?${nextLink}`,
            };
            const result = await getUserByName(search, limit, offset);
            return helper.response(response, 200, "Success Get All User", result, pageInfo);
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error);
        }
    },
    getUserById: async (request, response) => {
        try {
            const { id } = request.params
            const result = await getUserById(id)
            if (result.length > 0) {
                return helper.response(response, 200, "Success Get User By Id", result);
            } else {
                return helper.response(response, 404, `User By Id: ${id} Not Found`);
            }
        } catch (error) {
            return helper.response(response, 400, 'Bad Request', error)
        }
    },
    patchPassword: async (request, response) => {
        try {
            const { user_id } = request.params;
            const { old_password, user_password } = request.body
            if (
                request.body.old_password === undefined ||
                request.body.old_password === null ||
                request.body.old_password === ""
            ) {
                return helper.response(response, 404, "Old Password must be filled");
            } else if (
                request.body.user_password === undefined ||
                request.body.user_password === null ||
                request.body.user_password === ""
            ) {
                return helper.response(response, 404, "New Password must be filled");
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
            }
            const checkUser = await getUserById(user_id)
            if (checkUser.length > 0) {
                const getPassword = await getPasswordById(user_id)
                if (getPassword[0].user_password.length > 0) {
                    const checkPassword = bcrypt.compareSync(
                        old_password,
                        getPassword[0].user_password
                    );
                    if (checkPassword) {
                        const salt = bcrypt.genSaltSync(10);
                        const encryptPassword = bcrypt.hashSync(user_password, salt);
                        const setDataUser = {
                            user_password: encryptPassword,
                        }
                        const result = await patchUser(setDataUser, user_id);
                        return helper.response(
                            response,
                            200,
                            "Success Password Updated",
                            result
                        );
                    } else {
                        return helper.response(response, 400, "Wrong Password !");
                    }
                } else {
                    return helper.response(response, 404, "Password is empty");
                }
            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
    patchProfile: async (request, response) => {
        try {
            const { user_id } = request.params;
            const { user_first_name, user_last_name, user_phone } = request.body
            const phoneInDatabase = await isPhone_OtherUserExist(user_id, user_phone)
            if (
                request.body.user_first_name === undefined ||
                request.body.user_first_name === null ||
                request.body.user_first_name === ""
            ) {
                return helper.response(response, 404, "First name must be filled");
            } else if (
                request.body.user_last_name === undefined ||
                request.body.user_last_name === null ||
                request.body.user_last_name === ""
            ) {
                return helper.response(response, 404, "Last name must be filled");
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
            } else if (
                phoneInDatabase.length > 0
            ) {
                return helper.response(response, 404, "Phone Number already exist");
            } else {
                const checkUser = await getUserById(user_id)
                if (checkUser.length > 0) {
                    const setDataUser = {
                        user_first_name: user_first_name,
                        user_last_name: user_last_name,
                        user_phone: user_phone,
                    }
                    const result = await patchUser(setDataUser, user_id);
                    return helper.response(
                        response,
                        200,
                        "Success Profile Updated",
                        result
                    );

                } else {
                    return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
                }
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
    patchImage: async (request, response) => {
        try {
            const { user_id } = request.params;
            const checkUser = await getUserById(user_id)
            if (checkUser.length > 0) {
                const setDataUser = {
                    user_picture: request.file
                }
                if (
                    checkUser[0].user_picture === "blank.jpg"
                ) {
                    if (request.file === undefined) {
                        setDataUser.user_picture = 'blank.jpg'
                    } else {
                        setDataUser.user_picture = request.file.filename
                    }
                    const result = await patchUser(setDataUser, user_id);
                    return helper.response(
                        response,
                        200,
                        "Success Image Updated",
                        result
                    );
                } else if (request.file === undefined) {
                    setDataUser.user_picture = checkUser[0].user_picture
                    const result = await patchUser(setDataUser, user_id);
                    return helper.response(
                        response,
                        200,
                        "Success Image Updated",
                        result
                    );
                } else {
                    setDataUser.user_picture = request.file.filename
                    fs.unlink(`./uploads/${checkUser[0].user_picture}`, (error) => {
                        if (error) {
                            throw error
                        }
                    })
                    const result = await patchUser(setDataUser, user_id);
                    return helper.response(
                        response,
                        200,
                        "Success Image Updated",
                        result
                    );
                }
            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
    deleteImage: async (request, response) => {
        try {
            const { user_id } = request.params;
            const checkUser = await getUserById(user_id)
            if (checkUser.length > 0) {
                const setDataUser = {
                    user_picture: 'blank.jpg'
                }
                if (
                    checkUser[0].user_picture === "blank.jpg"
                ) {
                    const result = await patchUser(setDataUser, user_id);
                    return helper.response(
                        response,
                        200,
                        "Image Deleted Successfully",
                        result
                    );
                } else {
                    fs.unlink(`./uploads/${checkUser[0].user_picture}`, (error) => {
                        if (error) {
                            throw error
                        }
                    })
                    const result = await patchUser(setDataUser, user_id);
                    return helper.response(
                        response,
                        200,
                        "Image Deleted Successfully",
                        result
                    );
                }
            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
    isPinExist: async (request, response) => {
        try {
            const { user_id } = request.params
            const checkUser = await getUserById(user_id)
            const result = await checkPin(user_id)
            if (checkUser.length > 0) {
                if (result[0].user_pin.length > 0) {
                    return helper.response(response, 200, "Success get pin", result);
                } else {
                    return helper.response(response, 404, "Pin is empty");
                }
            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, 'Bad Request', error)
        }
    },
    checkPin: async (request, response) => {
        try {
            const { user_id } = request.params
            const { user_pin } = request.body
            if (
                request.body.user_pin === undefined ||
                request.body.user_pin === null ||
                request.body.user_pin === ""
            ) {
                return helper.response(response, 404, "Pin must be filled");
            }
            const checkUser = await getUserById(user_id)
            const result = await checkPin(user_id)
            if (checkUser.length > 0) {
                if (result[0].user_pin.length > 0) {
                    if (user_pin == result[0].user_pin) {
                        return helper.response(response, 200, "Pin Match", result);
                    } else {
                        return helper.response(response, 404, "Wrong Pin");
                    }
                } else {
                    return helper.response(response, 404, "Pin is empty");
                }
            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, 'Bad Request', error)
        }
    },
    patchPin: async (request, response) => {
        try {
            const { user_id } = request.params;
            const { user_pin } = request.body
            if (
                request.body.user_pin === undefined ||
                request.body.user_pin === null ||
                request.body.user_pin === ""
            ) {
                return helper.response(response, 404, "Pin must be filled");
            }
            const checkUser = await getUserById(user_id)
            if (checkUser.length > 0) {
                const setDataUser = {
                    user_pin: user_pin,
                }
                const result = await patchUser(setDataUser, user_id);
                return helper.response(
                    response,
                    200,
                    "Success Pin Updated",
                    result
                );

            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
    deactivateUser: async (request, response) => {
        try {
            const { user_id } = request.params;
            const checkUser = await getUserById(user_id)
            if (checkUser.length > 0) {
                const setDataUser = {
                    user_status: '0',
                }
                const result = await patchUser(setDataUser, user_id);
                return helper.response(
                    response,
                    200,
                    "Success Deactivate User",
                    result
                );
            } else {
                return helper.response(response, 404, `User By Id: ${user_id} Not Found`)
            }
        } catch (error) {
            return helper.response(response, 400, "Bad Request", error)
        }
    },
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
                const phoneInDatabase = await isPhoneExist(user_phone)
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
                } else if (
                    phoneInDatabase.length > 0
                ) {
                    return helper.response(response, 404, "Phone Number already exist");
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
                let email_body = `
                <div>
                    <h2>Hello Wall-E Friends</h2>
                    <a href="${process.env.URL_FRONT}activate?keys=${keys}">
                        Click Here To Activate Your Account
                    </a>
                </div>
                `
                await updating(data, user_email)
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.PASS_EMAIL,
                    },
                });

                let info = await transporter.sendMail({
                    from: `"PT Wall-E 👻" <${process.env.USER_EMAIL}>`,
                    to: user_email,
                    subject: "Activation Email ✔",
                    html: email_body,
                });
                const newResult = { message_sent: info.messageId }
                return helper.response(response, 200, 'Email has been sent !', newResult)
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
            return helper.response(response, 400, "Bad Request", error)
        }
    },
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
                        user_phone,
                        user_picture,
                        user_pin,
                        user_role,
                        user_status,
                    } = checkDataUser[0];
                    let payload = {
                        user_id,
                        user_pin
                    };
                    if (user_status == 0) {
                        return helper.response(
                            response,
                            400,
                            "Your Account is not Active"
                        );
                    } else {
                        const token = jwt.sign(payload, "RAHASIA", { expiresIn: "2h" });
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

                let email_body = `
                <div>
                    <h2>Hello Wall-E Friends</h2>
                    <a href="${process.env.URL_FRONT}setpassword?keys=${keys}">Click Here to change your password
                    </a>
                </div>
                `
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        user: process.env.USER_EMAIL,
                        pass: process.env.PASS_EMAIL,
                    },
                });

                let info = await transporter.sendMail({
                    from: `"PT Wall-E" <${process.env.USER_EMAIL}>`,
                    to: user_email,
                    subject: "Change Password Confimation",
                    html: email_body,
                });

                console.log("Message sent: %s", info.messageId);
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
