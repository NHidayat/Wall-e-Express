const helper = require("../helper/index");
const {
    getAllUser,

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
}
