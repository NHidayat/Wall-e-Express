const helper = require('../helper/index');
const { getUserByIdV2, patchUser } = require('../model/users')
const { postTransfer, postNotification } = require('../model/m_transfer')

module.exports = {
    postTransfer: async (request, response) => {
        const { user_id_a, user_id_b, transfer_amount, user_pin } = request.body

        if (
            user_id_a == '' || user_id_a == undefined ||
            user_id_b == '' || user_id_b == undefined ||
            transfer_amount == '' || transfer_amount == undefined ||
            user_pin == '' || user_pin == undefined
        ) {
            return helper.response(response, 403, 'Data is not complete')
        }

        try {
            const checkUser = await getUserByIdV2(user_id_a)

            if (checkUser.length < 1) {
                return helper.response(response, 404, 'User is not found!')

            } else {
                if (user_pin !== checkUser[0].user_pin) {
                    return helper.response(response, 403, 'Your PIN is Wrong')

                } else if (transfer_amount > checkUser[0].user_balance) {
                    return helper.response(response, 403, `Sorry, your account balance is not sufficient for this transaction. Your account balance is Rp ${checkUser[0].user_balance}`)

                } else {
                    const newTransId = new Date().getTime()
                    let setData = {
                        transfer_id: newTransId,
                        user_id_a,
                        user_id_b,
                        user_role: 1,
                        transfer_amount,
                    }
                    const post1 = await postTransfer(setData)
                    const calBalance = new Number(checkUser[0].user_balance) - new Number(transfer_amount)
                    const setSaldo = {
                        user_balance: calBalance
                    }
                    const UpdateUserBalance = await patchUser(setSaldo, user_id_a)

                    const setNewData = {
                        ...setData,
                        user_id_a: user_id_b,
                        user_id_b: user_id_a,
                        user_role: 2
                    }
                    const post2 = await postTransfer(setNewData)

                    const fullName = checkUser[0].user_first_name + ' ' + checkUser[0].user_last_name
                    const setNotifData = {
                        user_id: user_id_b,
                        notif_subject: 'Transfered from ' + fullName,
                        transfer_amount,
                    }
                    const postNotif = postNotification(setNotifData)

                    const newResult = { post1, post2 }
                    return helper.response(response, 200, 'Your transfer was successful', newResult)
                }
            }
        } catch (e) {
            console.log(e)
            return helper.response(response, 400, 'Bad Request', newResult)
        }
    },
    getTransferByUser:async (request, response) => {
    	const { id } = request.params
    	console.log(id)
    }
}