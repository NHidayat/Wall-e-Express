const helper = require('../helper/index');
const { getUserByIdV2, patchUser } = require('../model/users')
const { postTransfer, getTransferByUser, getWeekBalance, getDailyBalance, getTransferCount } = require('../model/m_transfer')
const { postNotification } = require('../model/m_notification')

module.exports = {
    postTransfer: async (request, response) => {
        const { user_id_a, user_id_b, transfer_amount, user_pin, transfer_note } = request.body

        if (
            user_id_a == '' || user_id_a == undefined ||
            user_id_b == '' || user_id_b == undefined ||
            transfer_note == undefined ||
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
                        transfer_note,
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

                    const fullName_B = checkUserB[0].user_first_name + ' ' + checkUserB[0].user_last_name
                    const setNotifData_A = {
                        user_id: user_id_a ,
                        notif_subject: 'Transfer to ' + fullName_B + ' was successful',
                        transfer_amount,
                    }
                    const fullName_A = checkUserA[0].user_first_name + ' ' + checkUserA[0].user_last_name
                    const setNotifData_B = {
                        user_id: user_id_b,
                        notif_subject: 'Transfered from ' + fullName_A,
                        transfer_amount,
                    }

                    const postNotif_userA = await postNotification(setNotifData_A)
                    const postNotif_userB = await postNotification(setNotifData_B)

                    const newResult = { post1, post2 }
                    const formatBalanceA = helper.formatN(calBalanceA)
                    return helper.response(response, 200, `Your transfer was successful. Now, Your account balance is Rp ${formatBalanceA}`, newResult)
                }
            }
        } catch (e) {
            return helper.response(response, 400, 'Bad Request')
        }
    },
    getUserTransfer: async (request, response) => {
        const { id } = request.params
        let { page, limit } = request.query
        page = page == undefined || page == '' ? 1 : parseInt(page)
        limit = limit == undefined || limit == '' ? 5 : parseInt(limit)

        const totalData = await getTransferCount(id)
        const totalPage = Math.ceil(totalData / limit)
        let offset = page * limit - limit

        let prevLink = helper.getPrevLink(page, request.query)
        let nextLink = helper.getNextLink(page, totalPage, request.query)

        const pageInfo = {
            page,
            totalPage,
            limit,
            totalData,
            prevLink: prevLink && `http://127.0.0.1:3000/history?${prevLink}`,
            nextLink: nextLink && `http://127.0.0.1:3000/history?${nextLink}`
        }

        try {
            const checkUser = await getUserByIdV2(id)

            if (checkUser.length < 1) {
                return helper.response(response, 404, 'User is not found!')

            } else {
                const result = await getTransferByUser(id, limit, offset)

                for (i = 0; i < result.length; i++) {
                    const getName = await getUserByIdV2(result[i].user_id_b)
                    result[i].user_name_b = getName[0].user_first_name + ' ' + getName[0].user_last_name
                    result[i].user_picture_b = getName[0].user_picture
                }

                helper.response(response, 200, `Success get transaction by user ID ${id}`, result, pageInfo)
            }
        } catch (e) {
            return helper.response(response, 400, 'Bad Request')
        }
    },
    getBalanceStatistic: async (request, response) => {
        const { id } = request.params
        try {
            const weekExpense = await getWeekBalance(id, 1)
            const weekIncome = await getWeekBalance(id, 2)
            const dailyExpense = await getDailyBalance(id, 1)
            const dailyIncome = await getDailyBalance(id, 2)

            const options = { weekday: 'long' }
            for (let i = 0; i < dailyExpense.length; i++) {
                dailyExpense[i].day = new Intl.DateTimeFormat('en-US', options).format(dailyExpense[i].date)
            }

            for (let i = 0; i < dailyIncome.length; i++) {
                dailyIncome[i].day = new Intl.DateTimeFormat('en-US', options).format(dailyIncome[i].date)
            }
            const result = { weekExpense, weekIncome, dailyExpense, dailyIncome }
            helper.response(response, 200, `Success get balance statistic by user ID ${id}`, result)
        } catch (e) {
            return helper.response(response, 400, 'Bad Request')
        }
    }
}