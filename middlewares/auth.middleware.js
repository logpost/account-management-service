import { ExtractJwt, Strategy } from 'passport-jwt'

import ShipperAdapter from '../adapters/shipper.adapter'
import passport from 'passport'
import config from '../config'

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
  // return done(null, true)
  try {
      const { username, email } = payload
      const {data: account} = await ShipperAdapter.findAccountByUsername(username)
      if (account) {
        const user = {
          isConfirmEmail: false,
          profile : {
            _id: account._id,
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
  return done(null, true)
//   try {
//     const { username } = payload
//     const account = await ShipperAdapter.findAccountByUsername(username)
//     if (account) {
//       const user = {
//         isConfirmEmail: false,
//         profile : {
//           _id: account._id,
//           username: account.username,
//           email: account.email,
//           account_type: account.account_type
//         }
//       }

//       if(account.email !== 'not_confirm')
//         user.isConfirmEmail = true

//       return done(null, user)

//     } else {
//       return done(null, false)
//     }

// } catch (error) {
//     return done(error, false)
// }
}))

export default {
  requireAuth: passport.authenticate('private-route-rule', { session: false }),
  verifyEmail: passport.authenticate('verify-confirm-email', { session: false })
}