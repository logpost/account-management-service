import { ExtractJwt, Strategy } from 'passport-jwt'
import UserService from '../services/user.service'
import passport from 'passport'
import config from '../config'

const userService = new UserService()

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwt.secret.jwt_secret,
    issuer: config.jwt.options.issuer,
    audience: config.jwt.options.audience,
  }

const jwtAuth = new Strategy(options, async (payload, done) => {
    
    try {
        const user_id = payload.sub
        const info = await userService.findUserById(user_id)
        if (info) {
            const user = {
              _id: info._id,
              username: info.username,
              profile: info.profile,
            }
            return done(null, user)
        } else {
            return done(null, false)
        }

    } catch (error) {
        return done(error, false)
    }
})

passport.use(jwtAuth)

export default passport.authenticate('jwt', { session: false })