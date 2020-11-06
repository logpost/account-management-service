import jwt from 'jsonwebtoken'
import NodeMailerAdapter from '../adapters/nodemailer.adapter'
import AccountFactory from '../factorys/account.factory'
import config from '../config'
import { compareHashed } from '../helper/hashing.handler'

class AccountUsecase {
    
    fetcher = new AccountFactory()

    signup = async (role, profile) => {
        const { username, email, name, account_type } = profile
        const res = await this.fetcher.account[role].createAccount(profile)
        if(res.status === 200){ 
            const payload = { username, email, name, role, account_type }
            const claims = { 
                expiresIn: config.jwt.confirm_email.options.expires_in,
                issuer: config.jwt.confirm_email.options.issuer,
                audience: config.jwt.confirm_email.options.audience,
            }
            const secret = config.jwt.confirm_email.secret.jwt_secret
            const token_email = jwt.sign(payload, secret, claims)
            const transporter = await NodeMailerAdapter.getInstance()
            transporter.send(name, email, role, token_email)
            return { token_email, message: `Done, Message sent to ${email} success. Check your mailbox.` }
        
        }
        throw new Error(res.error.message)
    }

    login = async (role, username, password) => { 
        const res = await this.fetcher.account[role].adminFindAccountByUsername(username)
        const { data: account } = res
        if(account){
            const authorized = await compareHashed(password, account.password)
            if(authorized){
                const payload =  { 
                    username: account.username, 
                    name: account.name, 
                    display_name: account.display_name,
                    email: account.email, 
                    account_type: account.account_type,
                    role
                 }
                const claims = { 
                    expiresIn: config.jwt.private_route.options.expires_in,
                    issuer: config.jwt.private_route.options.issuer,
                    audience: config.jwt.private_route.options.audience,
                    subject: account._id.toString(),
                }
                const secret = config.jwt.private_route.secret.jwt_secret
                return jwt.sign(payload, secret, claims)
            }
            throw new Error('400 : Invalid, password is not match')
        }
        throw new Error(res.error.message)
    }
    
    adminFindAccountByUsername = async (role, username) => {
        const res = await this.fetcher.account[role].adminFindAccountByUsername(username)
        return res 
    }

    confirmedWithEmail = async (role, username, email) => {
        const res = await this.fetcher.account[role].confirmedWithEmail(username, email)
        return res 
    }

    createService = async (service_name) => {
        const payload = { username: service_name }
        const claims = { 
            issuer: service_name,
            audience: service_name,
            subject: service_name,
        }
        const secret = config.jwt.private_route.secret.jwt_secret
        return jwt.sign(payload, secret, claims)
    }

}

export default AccountUsecase
