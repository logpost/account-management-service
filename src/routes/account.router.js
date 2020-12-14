import express from 'express'

import AccountUsecase from '../usecase/account.usecase'
import NodeMailerAdapter from '../adapters/nodemailer.adapter'
import passport from '../middlewares/auth.middleware'
import responseHandler, { responseSender } from '../helper/response.handler'


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

router.get(`${prefix}/healthcheck/token/private`, passport.verifyAuth, async (req, res) => {
    responseHandler(async () => {
        return { msg: `ok ${req.user}, verify token_private`}
    }, res)
})

router.post(`${prefix}/signup/:role`, async (req, res) => {
    responseHandler(async () => {
        const { role } = req.params
        const profile = req.body
        if(role){
            const data =  await accountUsecase.signup(role, profile)
            return data
        } else {
            throw new Error('400 : Invalid, role is empty on param query')
        }
    }, res)
})

router.post(`${prefix}/login/:role`, async (req, res) => {
    responseHandler(async () => {
        const { role } = req.params
        const { username, password } = req.body 
        if(role){
            const token = await accountUsecase.login(role, username, password)
            return { token }
        } else {
            throw new Error('400 : Invalid, role is empty on param query')
        }
    }, res)
})

router.post(`${prefix}/email/confirm/send`, passport.verifyEmail, async (req, res) => {
    responseHandler(async () => {
        const { isConfirmEmail, role, name, email } = req.user
        const { token_email } = req.params
        
        if(isConfirmEmail)
            return `200 : ${email} has been confirmed.`

        const transporter = await NodeMailerAdapter.getInstance()
        transporter.send(name, email, role, token_email)
        return `200 : Done, Message sent to ${email} success. Check your mailbox.`
    }, res)
})

router.get(`${prefix}/email/confirm/recive/success`, passport.verifyEmail, async (req, res) => {
        const { isConfirmEmail, role, email, username } = req.user    
        if(isConfirmEmail) {
            responseSender( `200 : ${email} has been confirmed.`, res)
        }

        try {
            await accountUsecase.confirmedWithEmail(role, username, email)
            res.redirect('https://google.com')    
        } catch (error) {
            responseSender(new Error(error), res)
        }
})

router.get(`${prefix}/create/service/:service_name`, async (req, res) => {
    responseHandler(async () => {
        const { service_name } = req.params
        console.log(service_name)
        const token_service = await accountUsecase.createService(service_name)
        return { token_service }
    }, res)
})

export default router