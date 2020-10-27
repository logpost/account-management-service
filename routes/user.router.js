import express from 'express'
import createError from 'http-errors'
import UserService from '../services/user.service'
import requireAuth from '../middlewares/auth'
const prefix = '/user'
const router = express.Router()
const userService = new UserService()

router.get(`${prefix}/healthcheck`, (req, res) => {
    res.send('Server is alive.')
})

router.post(`${prefix}/signup`, async (req, res, next) => {
    const profile = req.body 
    try {
        const user = await userService.createAccount(profile)
        res.send(user)
    } catch (error) {
        next(createError(400, error.message))
    }
})

router.post(`${prefix}/login`, async (req, res, next) => {
    
    const { username, password } = req.body 
    try {
        const token = await userService.login(username, password)
        res.send({ token })
    } catch (error) {
        next(createError(400, error.message))
    }
})

router.put(`${prefix}/profile/update`, requireAuth, async (req, res, next) => {
    const user = req.user
    const profile = req.body
    console.log(user, profile)
    const user_info = await userService.updateProfileAccount(
      user._id,
      profile,
    )
    res.send(user_info)
  })



export default router