const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: FacebookStrategy } = require('passport-facebook');

const User = require('../models/User');
const { ...HELPER } = require('../helper/h_util');


/** Sign in using Email and Password.**/
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
	User.findOne({ email: email.toLowerCase() }, (err, user) => {
		if (err) {
			let response = HELPER.getResponse({ errors: HELPER.getServerError(err) })
			return done(response);
		}
		if (!user) {
			let response = HELPER.getResponse({ errors: HELPER.getServerError(`Email ${email} not found.`, `email`, email) })
			return done(null, false, response);
		}
		//   if (!user.password) {
		//     return done(null, false, { msg: 'Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile.' });
		//   }
		user.comparePassword(password, (err, isMatch) => {
			if (err) {
				let response = HELPER.getResponse({ errors: HELPER.getServerError(err) })
				return done(response);
			}
			if (isMatch) {
				return done(null, user);
			}
			let response = HELPER.getResponse({ errors: HELPER.getServerError(`Invalid email or password.`) })
			return done(null, false, response);
		});
	});
}));


/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy({
	clientID: 1758471507617747,
	clientSecret: `c40c51e18180e105ec84477c42046339`,
	callbackURL: `http://localhost:3000/auth/fb/cb`,
	profileFields: ['name', 'email', 'link', 'locale', 'timezone', 'gender'],
	passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {


	if (req.user) {
		User.findOne({ facebook: profile.id }, (err, existingUser) => {
			if (err) { return done(err); }
			if (existingUser) {
				req.flash('errors', { msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.' });
				done(err);
			} else {
				User.findById(req.user.id, (err, user) => {
					if (err) { return done(err); }
					user.facebook = profile.id;
					user.tokens.push({ kind: 'facebook', accessToken });
					user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
					user.profile.gender = user.profile.gender || profile._json.gender;
					user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
					user.save((err) => {
						req.flash('info', { msg: 'Facebook account has been linked.' });
						done(err, user);
					});
				});
			}
		});
	} else {

		User.findOne({ facebook: profile.id }, (err, existingUser) => {
			if (err) {
				console.log(err)
				return done(err);
			}
			if (existingUser) {
				console.log(existingUser)

				return done(null, existingUser);
			}
			User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
				if (err) { return done(err); }
				if (existingEmailUser) {
					// req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.' });
					console.log(existingEmailUser)

					done(err);
				} else {
					const user = new User();
					console.log(user)
					user.email = profile._json.email;
					user.facebook = profile.id;
					user.tokens.push({ kind: 'facebook', accessToken });
					user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
					user.profile.gender = profile._json.gender;
					user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
					user.profile.location = (profile._json.location) ? profile._json.location.name : '';
					user.save((err) => {
						done(err, user);
					});
				}
			});
		});
	}
}));

