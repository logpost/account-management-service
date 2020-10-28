import jwt from 'jsonwebtoken'
import NodeMailerAdapter from '../adapters/nodemailer.adapter'
import ShipperAdapter from '../adapters/shipper.adapter'
import config from '../config'
import { hashing, compareHashed } from '../helper/hashing.handler'

class AccountUsecase {
    
    fetcher = {
        shipper: ShipperAdapter,
        carrier: null
    }
    // schema = null 
    // model = null
    // collection = null

    // constructor(){
    //     this.schema = User
    //     this.collection = config.db.mongo.collection
    //     this.model = model(this.collection, this.schema) 
    // }

    // findUserById = async (id) => {
    //     const user = await this.model.findById(id)
    //     return user
    // }

    // findUserByUsername = async (username) => {
    //     return await this.model.findOne({ username })
    // }

    signup = async (account_type, profile) => {
        const { username, email, name } = profile
        const res = await this.fetcher[account_type].createAccount(profile)
        if(res.status === 200){ 
            const payload = { email, username }
            const claims = { 
                expiresIn: config.jwt.confirm_email.options.expires_in,
                issuer: config.jwt.confirm_email.options.issuer,
                audience: config.jwt.confirm_email.options.audience,
            }
            const secret = config.jwt.confirm_email.secret.jwt_secret
            const token_email =  jwt.sign(payload, secret, claims)

            const transporter = await NodeMailerAdapter.getInstance()
            transporter.send(name, email, token_email)
            return { token_email, message: `Done, Message sent to ${email} success. Check your mailbox.` }
        
        }
        throw new Error(res.error.message)
    }

    login = async (account_type, username, password) => { 
        const { data: account} = await this.fetcher[account_type].findAccountByUsername(username)
        if(account){
            const authorized = await compareHashed(password, account.password)
            if(authorized){
                const payload = { username: account.username }
                const claims = { 
                    expiresIn: config.jwt.private_route.options.expires_in,
                    issuer: config.jwt.private_route.options.issuer,
                    audience: config.jwt.private_route.options.audience,
                    subject: account._id.toString(),
                }
                const secret = config.jwt.private_route.secret.jwt_secret
                return jwt.sign(payload, secret, claims)
            }
            throw new Error('Invalid, password is not match')
        }
        throw new Error('Invalid, username is not found in database')
    }
    
    // updateProfileAccount = async (id, profile) => {
    //     // const user = await this.model.findById(userId)
    //     const user = await this.model.updateOne({ id }, { $set: profile })
    //     return user
    // }
}

export default AccountUsecase
