import jwt from 'jsonwebtoken'
import { model } from 'mongoose'
import User from '../models/user.model'
import config from '../config'
import { hashing, compareHashed } from '../helper/hashing.handler'

class UserService {

    schema = null 
    model = null
    collection = null

    constructor(){
        this.schema = User
        this.collection = config.db.mongo.collection
        this.model = model(this.collection, this.schema) 
    }

    findUserById = async (id) => {
        const user = await this.model.findById(id)
        return user
    }

    findUserByUsername = async (username) => {
        return await this.model.findOne({ username })
    }

    createAccount = async (profile) => {
        const { username, password } = profile
        const existingUser = await this.findUserByUsername(username)
        
        if(!existingUser){
            const hashed = await hashing(password)
            const userAccount = new this.model({ ...profile, password: hashed })
            return await userAccount.save()
        }
    }

    login = async (username, password) => { 
        const user = await this.findUserByUsername(username)
        if(user){
            const authorized = await compareHashed(password, user.password)
            if(authorized){
                const payload = { username: user.username }
                const claims = { 
                    expiresIn: config.jwt.options.expires_in,
                    issuer: config.jwt.options.issuer,
                    audience: config.jwt.options.audience,
                    subject: user._id.toString(),
                }
                const secret = config.jwt.secret.jwt_secret
                return jwt.sign(payload, secret, claims)
            }
            throw new Error('Invalid, password is not match')
        }
        throw new Error('Invalid, username is not found in database')
    }
    
    updateProfileAccount = async (id, profile) => {
        // const user = await this.model.findById(userId)
        const user = await this.model.updateOne({ id }, { $set: profile })
        return user
    }
}

export default UserService
