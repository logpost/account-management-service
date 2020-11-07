import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import AccountUsecase from '../usecase/account.usecase'
import config from '../config'
import { checkAccountDidConfirmEmail } from '../helper/policy.handler'

const accountUsecase = new AccountUsecase()

const options_email_rule = {
  jwtFromRequest: ExtractJwt.fromUrlQueryParameter("token_email"),
  secretOrKey: config.jwt.confirm_email.secret.jwt_secret,
  issuer: config.jwt.confirm_email.options.issuer,
  audience: config.jwt.confirm_email.options.audience,
}

const options_auth_rule = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.private_route.secret.jwt_secret,
  issuer: config.jwt.private_route.options.issuer,
  audience: config.jwt.private_route.options.audience,
}

passport.use("email_rule", new Strategy(options_email_rule, async (payload, done) => {  
  	try {
		const { username, role } = payload
		const { data: account } = await accountUsecase.adminFindAccountByUsername(role, username)
		
		if (account)
			return done(null, payload)

		// this case its not test yet !!!!
		return done(null, false)
		
	} catch (error) {
		return done(error, false)
	}
}))

passport.use("auth_rule", new Strategy(options_auth_rule, async (payload, done) => {  
    try {
		const { username, role } = payload
		const account = await accountUsecase.adminFindAccountByUsername(role, username)
		
		if (account) {
			const user = {
				isConfirmEmail: false,
				shipper_id: account._id,
				username: account.username,
				name: account.name,
				display_name: account.display_name,
				email: account.email,
				account_type: account.account_type,
				role
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
  verifyAuth: passport.authenticate('auth_rule', { session: false }),
  verifyEmail: passport.authenticate('email_rule', { session: false })
}