import express from 'express'

import responseHandler from '../helper/response.handler'
import passport from '../middlewares/auth.middleware'
import AccountUsecase from '../usecase/account.usecase'
import NodeMailerAdapter from '../adapters/nodemailer.adapter'

const prefix = '/account'
const router = express.Router()
const accountUsecase = new AccountUsecase()

router.get(`${prefix}/healthcheck`, (req, res) => {
    responseHandler(async () => {
        return 'Server is alive.'
    }, res)
})

router.get(`${prefix}/healthcheck/token/email`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify token_email`}
    }, res)
})

router.get(`${prefix}/healthcheck/token/private`, passport.requireAuth, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify token_private`}
    }, res)
})

router.post(`${prefix}/signup/:role`, async (req, res) => {
    responseHandler(async () => {
        const { role } = req.params
        const profile = req.body 
        const data =  await accountUsecase.signup(role, profile)
        return data
    }, res)
})

router.post(`${prefix}/login/:role`, async (req, res) => {
    responseHandler(async () => {
        const { role } = req.params
        const { username, password } = req.body 
        const token = await accountUsecase.login(role, username, password)
        return { token }
    }, res)
})

router.post(`${prefix}/email/confirm/publish`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const { isConfirmEmail, role, profile } = req.user
        const { name, email } = profile
        const { token_email } = req.params
        if(isConfirmEmail)
            return `200 : ${email} has been confirmed.`
        const transporter = await NodeMailerAdapter.getInstance()
        await transporter.send(name, email, role, token_email)
        return `200 : Done, Message sent to ${email} success. Check your mailbox.`
        
    }, res)
})

router.get(`${prefix}/email/confirm/consume`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const { isConfirmEmail, role, profile} = req.user
        console.log(isConfirmEmail, role, profile)
        const { email, username } = profile
        if(isConfirmEmail)
            return `200 : ${email} has been confirmed.`
        const res = await accountUsecase.confirmedWithEmail(role, username, email)
        return res.data.success.message
    }, res)
})

router.get(`${prefix}/create/service/:service_name`, async (req, res) => {
    responseHandler(async () => {
        const { service_name } = req.params
        console.log(service_name)
        const token_service = await accountUsecase.createService(service_name)
        return { token_service}
    }, res)
})

export default router