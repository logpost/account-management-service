import express from 'express'

import responseHandler from '../helper/response.handler'
import passport from '../middlewares/auth.middleware'
import AccountUsecase from '../usecase/account.usecase'
import NodeMailerAdapter from '../adapters/nodemailer.adapter'
import ShipperAdapter from '../adapters/shipper.adapter'

const prefix = '/account'
const router = express.Router()
const account = new AccountUsecase()

router.get(`${prefix}/healtcheck`, (req, res) => {
    responseHandler(async () => {
        return 'Server is alive.'
    }, res)
})

router.get(`${prefix}/healtcheck/token/email`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify token_email`}
    }, res)
})

router.get(`${prefix}/healtcheck/token/private`, passport.requireAuth, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify token_private`}
    }, res)
})

router.post(`${prefix}/signup/:account_type`, async (req, res) => {
    responseHandler(async () => {
        const { account_type } = req.params
        const profile = req.body 
        const token_email =  await account.signup(account_type, profile)
        return { token_email }
    }, res)
})

router.post(`${prefix}/login/:account_type`, async (req, res) => {
    responseHandler(async () => {
        const { account_type } = req.params
        const { username, password } = req.body 
        const token = await account.login(account_type, username, password)
        return { token }
    }, res)
})

router.post(`${prefix}/email/confirm/publish`, async (req, res) => {
    responseHandler(async () => {
        const { email, token_email } = req.body 
        const transporter = await NodeMailerAdapter.getInstance()
        transporter.send(email, token_email)
        return `Done, Message sent to ${email} success. Check your mailbox.`
    }, res)
})

router.get(`${prefix}/email/confirm/consume`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const user = req.user
        if(user.isConfirmEmail)
            return `200 : ${email} has been confirmed.`
        const { email, username } = user.profile
        const res = await ShipperAdapter.confirmedWithEmail(username, email)
        return res.data.success.message
    }, res)
})

export default router