import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import AccountFactory from '../factorys/account.factory'
import config from '../config'

const fetcher = new AccountFactory()

const options_verify_confirm_email = {
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token_email"),
  secretOrKey: config.jwt.confirm_email.secret.jwt_secret,
  issuer: config.jwt.confirm_email.options.issuer,
  audience: config.jwt.confirm_email.options.audience,
}

const options_private_route = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.private_route.secret.jwt_secret,
  issuer: config.jwt.private_route.options.issuer,
  audience: config.jwt.private_route.options.audience,
}

passport.use("verify-confirm-email", new Strategy(options_verify_confirm_email, async (payload, done) => {  
  try {
      const { username, email, account_type } = payload
      const { data: account } = await fetcher.account[account_type].findAccountByUsername(username)
      if (account) {
        const user = {
          isConfirmEmail: false,
          profile : {
            name: account.name,
            username: account.username,
            account_type: account.account_type,
            email,
          }
        }
          
        if(account.email !== 'not_confirm')
          user.isConfirmEmail = true

        return done(null, user)

      } else {
        return done(null, false)
      }

  } catch (error) {
      return done(error, false)
  }
}))

passport.use("private-route-rule", new Strategy(options_private_route, async (payload, done) => {  
  try {
    const { username, account_type } = payload
    const account = await fetcher.account[account_type].findAccountByUsername(username)
    if (account) {
      const user = {
        isConfirmEmail: false,
        profile : {
          shipper_id: account._id,
          username: account.username,
          name: account.name,
          display_name: account.display_name,
          email: account.email,
          account_type: account.account_type
        }
      }

      if(account.email !== 'not_confirm')
        user.isConfirmEmail = true

      return done(null, user)

    } else {
      return done(null, false)
    }

} catch (error) {
    return done(error, false)
}
}))

export default {
  requireAuth: passport.authenticate('private-route-rule', { session: false }),
  verifyEmail: passport.authenticate('verify-confirm-email', { session: false })
}