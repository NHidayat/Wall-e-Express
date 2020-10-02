const helper = require('../helper/index');
const { getUserByIdV2, patchUser } = require('../model/users')
const { postTransfer, getTransferByUser } = require('../model/m_transfer')
const { postNotification } = require('../model/m_notification')

module.exports = {
    postTransfer: async (request, response) => {
        const { user_id_a, user_id_b, transfer_amount, user_pin } = request.body

        if (
            user_id_a == '' || user_id_a == undefined ||
            user_id_b == '' || user_id_b == undefined ||
            transfer_amount == '' || transfer_amount == undefined || transfer_amount < 1 ||
            user_pin == '' || user_pin == undefined
        ) {
            return helper.response(response, 403, 'Data is not complete')
        }

        try {
            const checkUserA = await getUserByIdV2(user_id_a)
            const checkUserB = await getUserByIdV2(user_id_b)

            if (checkUserA.length < 1) {
                return helper.response(response, 404, `User with ID ${user_id_a} is not found!`)

            } else if (checkUserB.length < 1) {
                return helper.response(response, 404, `User target with ID ${user_id_b} is not found!`)

            } else {
                if (user_pin !== checkUserA[0].user_pin) {
                    return helper.response(response, 403, 'Your PIN is Wrong')

                } else if (transfer_amount > checkUserA[0].user_balance) {
                    const formatBalance = helper.formatN(checkUserA[0].user_balance)
                    return helper.response(response, 403, `Sorry, your account balance is not sufficient for this transaction. Your account balance is Rp ${formatBalance}`)

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
                    const calBalanceA = parseInt(checkUserA[0].user_balance) - parseInt(transfer_amount)

                    let setSaldo = {
                        user_balance: calBalanceA
                    }
                    const UpdateUserA_Balance = await patchUser(setSaldo, user_id_a)

                    let setNewData = {
                        ...setData,
                        user_id_a: user_id_b,
                        user_id_b: user_id_a,
                        user_role: 2
                    }
                    const post2 = await postTransfer(setNewData)
                    const calBalanceB = parseInt(checkUserB[0].user_balance) + parseInt(transfer_amount)
                    setSaldo.user_balance = calBalanceB
                    const UpdateUserB_Balance = await patchUser(setSaldo, user_id_b)

                    const fullName = checkUserA[0].user_first_name + ' ' + checkUserA[0].user_last_name
                    const setNotifData = {
                        user_id: user_id_b,
                        notif_subject: 'Transfered from ' + fullName,
                        transfer_amount,
                    }
                    const postNotif = postNotification(setNotifData)

                    const newResult = { post1, post2 }
                    const formatBalanceA = helper.formatN(calBalanceA)
                    return helper.response(response, 200, `Your transfer was successful. Now, Your account balance is Rp ${formatBalanceA}`, newResult)
                }
            }
        } catch (e) {
            console.log(e)
            return helper.response(response, 400, 'Bad Request')
        }
    },
    getUserTransfer: async (request, response) => {
        const { id } = request.params
        try {
            const checkUser = await getUserByIdV2(id)

            if (checkUser.length < 1) {
                return helper.response(response, 404, 'User is not found!')

            } else {
                const result = await getTransferByUser(id)

                for (i = 0; i < result.length; i++) {
                    const getName = await getUserByIdV2(result[i].user_id_b)
                    result[i].user_name_b = getName[0].user_first_name + ' ' + getName[0].user_last_name
                }

                helper.response(response, 200, `Success get transaction by user ID ${id}`, result)
            }
        } catch (e) {
            console.log(e)
            return helper.response(response, 400, 'Bad Request')
        }
    }
}