import express from 'express'
import jwt from 'jsonwebtoken'

import responseHandler from '../helper/response.handler'
import passport from '../middlewares/auth.middleware'
import AccountUsecase from '../usecase/account.usecase'
import NodeMailerAdapter from '../adapters/nodemailer.adapter'
import ShipperAdapter from '../adapters/shipper.adapter'
import config from '../config'

const prefix = '/account'
const router = express.Router()
const account = new AccountUsecase()

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

router.post(`${prefix}/signup/:account_type`, async (req, res) => {
    responseHandler(async () => {
        const { account_type } = req.params
        const profile = req.body 
        const data =  await account.signup(account_type, profile)
        return data
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

router.post(`${prefix}/email/confirm/publish`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const user = req.user
        const { name, email } = req.user.profile
        const { token_email } = req.params
        if(user.isConfirmEmail)
            return `200 : ${email} has been confirmed.`
        const transporter = await NodeMailerAdapter.getInstance()
        await transporter.send(name, email, token_email)
        return `200 : Done, Message sent to ${email} success. Check your mailbox.`
        
    }, res)
})

router.get(`${prefix}/email/confirm/consume`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const user = req.user
        const { email, username } = user.profile
        if(user.isConfirmEmail)
            return `200 : ${email} has been confirmed.`
        const res = await ShipperAdapter.confirmedWithEmail(username, email)
        return res.data.success.message
    }, res)
})

router.get(`${prefix}/create/service/:service_name`, async (req, res) => {
    responseHandler(async () => {
        const { service_name } = req.params
        console.log(service_name)
        const token_service = await account.createService(service_name)
        return { token_service}
    }, res)
})

export default router