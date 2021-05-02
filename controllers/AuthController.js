const passport = require('passport');
var express = require('express')
var router = express.Router()
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi');
var pug = require('pug');

// let b=require('../views/mail-templates/forgotpassword')
const { getConfig } = require('../helper/app_helper/h_config');
const JWT_SECRET = getConfig(`APP.JWT_SECRET`);
const OTP_SECRET = getConfig(`APP.OTP_SECRET`);

const User = require('../models/User');
const { sendMail, getForgotPasswordTemplate } = require('../helper/h_email');
const { ...CONST } = require('../helper/app_helper/h_constant');



/**
 * POST /login
 * Sign in using email and password.
 */
router.post(CONST.POST_LOGIN, async (req, res, next) => {
	const schema = Joi.object({
		password: Joi.string()
			.min(8)
			.max(15)
			.required(),
		email: Joi.string()
			.email()
			.required()
	})
	let { error, value } = await schema.validate(req.body, { abortEarly: false });
	if (error) {

		let response = { errors: req.HELPER.getServerError(error) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr)
	}
	passport.authenticate('local', { session: false }, async (err, user, info) => {
		if (err) {
			let response = { errors: req.HELPER.getServerError(err) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 500, resarr)
		}
		if (!user) {

			let response = req.HELPER.getResponse(info)
			return req.HELPER.sendResponse(res, 404, response)
		}
		const token = jwt.sign({ sub: user._id }, JWT_SECRET);
		await User.updateOne(
			{ _id: user._id },
			{ $addToSet: { token: token } }
		)
		let response = req.HELPER.getResponse({ success: true, data: [{ token }], message: 'login successfully' })
		return req.HELPER.sendResponse(res, 201, response)
	})(req, res, next);
});

router.get(CONST.GET_LOGOUT, async (req, res) => {

	let { sub: _id } = res.jwt_payload
	let { TOKEN } = res

	try {

		let doc = await User.findOne({ _id: _id })
		if (!doc) {

			let response = { errors: req.HELPER.getServerError(CONST[404]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 404, resarr)
		}
		if (!TOKEN) {
			let response = { errors: req.HELPER.getServerError(CONST[400]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 400, resarr)
		}
		//remove current token from token list
		let tokensArr = doc.token.filter((e) => {

			return (e === TOKEN) === false;
		})
		doc.token = tokensArr;

		try {
			await doc.save();
			let response = req.HELPER.getResponse({ success: true, data: [], message: `logout successfully` })
			return req.HELPER.sendResponse(res, 200, response)

		} catch (err) {
			let response = { errors: req.HELPER.getServerError(CONST[500]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 500, resarr)
		}

	} catch (err) {
		let response = { errors: req.HELPER.getServerError(CONST[500]) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr);
	}
})

router.get(CONST.GET_LOGOUT_ALL, async (req, res) => {

	let { sub: _id } = res.jwt_payload

	try {

		let doc = await User.findOne({ _id: _id })
		if (!doc) {

			let response = { errors: req.HELPER.getServerError(CONST[404]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 404, resarr)
		}
		//remove all token from token list
		doc.token = [];
		try {
			await doc.save();
			let response = req.HELPER.getResponse({ success: true, data: [], message: `logout from all devices successfully` })
			return req.HELPER.sendResponse(res, 200, response)
		} catch (err) {
			let response = { errors: req.HELPER.getServerError(CONST[500]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 500, resarr)
		}
	} catch (err) {
		let response = { errors: req.HELPER.getServerError(CONST[500]) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr)
	}
})

//change password
router.post(CONST.POST_UPDATE_PASS, async (req, res) => {

	let { oldPassword, password, confirmPassword } = req.body
	let { sub: _id } = res.jwt_payload

	const schema = Joi.object({
		password: Joi.string()
			.min(8)
			.max(15)
			.required(),
		confirmPassword: Joi.ref('password'),
		oldPassword: Joi.string().required()
	}).with('password', 'confirmPassword')

	let { error, value } = await schema.validate(req.body, { abortEarly: false });
	if (error) {
		let response = { errors: req.HELPER.getValidationError(error) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 422, resarr);
	}
	if (!req.HELPER.isValidID(_id)) {
		let response = { errors: req.HELPER.getServerError("not valid id") };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 301, resarr);
	}
	try {
		let doc = await User.findOne({ _id: _id })
		if (!doc) {
			let response = { errors: req.HELPER.getServerError(CONST[404]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 404, resarr)
		}
		if (doc.isDeleted) {
			let response = { errors: req.HELPER.getServerError(CONST[405]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 405, resarr)
		}
		doc.comparePassword(oldPassword, async (err, isMatch) => {
			if (err) {
				let response = { errors: req.HELPER.getServerError(CONST[404]) };
				let resarr = req.HELPER.getResponse(response);
				return req.HELPER.sendResponse(res, 404, resarr)
			}
			if (isMatch) {
				//Upadet fields 	
				doc.password = password
				const newtoken = jwt.sign({ sub: doc._id }, JWT_SECRET);
				doc.token = [newtoken]
				try {
					await doc.save();
					let response = req.HELPER.getResponse({ success: true, data: [{ token: newtoken }], message: 'password changed successfully' })
					return req.HELPER.sendResponse(res, 201, response)
				} catch (err) {
					let response = { errors: req.HELPER.getServerError(CONST[500]) };
					let resarr = req.HELPER.getResponse(response);
					return req.HELPER.sendResponse(res, 500, resarr)
				}
			}
			let response = { errors: req.HELPER.getServerError(`Invalid password`) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 405, resarr)
		});
	} catch (err) {
		let response = { errors: req.HELPER.getServerError(CONST[500]) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr);
	}
})

//forgot password
router.post(CONST.POST_FORGOT_PASS, async (req, res) => {

	let { email } = req.body
	const schema = Joi.object({
		email: Joi.string().email().required()
	})

	let { error, value } = await schema.validate(req.body, { abortEarly: false });
	if (error) {
		let response = { errors: req.HELPER.getValidationError(error) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 422, resarr);
	}

	try {
		let doc = await User.findOne({ email: email })

		if (!doc) {
			let response = { errors: req.HELPER.getServerError(CONST[404]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 404, resarr)
		}
		if (doc.isDeleted) {
			let response = { errors: req.HELPER.getServerError(CONST[405]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 405, resarr)
		}
		//Upadet fields 	
		const token = jwt.sign({ sub: doc._id, email: email }, OTP_SECRET);
		doc.forgotPassword = {
			token: token,
			otp: Math.floor(1000 + Math.random() * 9000),
		}
		try {
			await doc.save();
			let html = await getForgotPasswordTemplate(doc.forgotPassword)
			await sendMail(email, `otp `, html).catch(console.log)
			let response = req.HELPER.getResponse({ success: true, data: [], message: 'otp sent on mail successfully' })
			return req.HELPER.sendResponse(res, 201, response)
		} catch (err) {
			let response = { errors: req.HELPER.getServerError(CONST[500]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 500, resarr);
		}

	} catch (err) {
		console.log({err})
		let response = { errors: req.HELPER.getServerError(CONST[500]) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr);
	}
})

//submit otp
router.post(CONST.POST_SUBMIT_OTP, async (req, res) => {

	const { otp, token: userToken } = req.body
	const schema = Joi.object({
		token: Joi.string().required(),
		otp: Joi.string().min(4).max(4).required()
	})

	let { error, value } = await schema.validate(req.body, { abortEarly: false });
	if (error) {
		let response = { errors: req.HELPER.getValidationError(error) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 422, resarr);
	}

	try {
		let doc = await User.findOne({ "forgotPassword.otp": otp, "forgotPassword.token": userToken })
		if (!doc) {
			let response = { errors: req.HELPER.getServerError(CONST[404]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 404, resarr)
		}
		if (doc.isDeleted) {
			let response = { errors: req.HELPER.getServerError(CONST[405]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 405, resarr)
		}
		//Upadet fields 	
		const token = await jwt.sign({ sub: doc._id, email: doc.email }, OTP_SECRET);
		doc.forgotPassword = {
			token: token,
			otp: 0000,// for internal sequrity used while creating password
		}
		try {
			await doc.save();
			let response = req.HELPER.getResponse({ success: true, data: [{ token }], message: 'otp submitted successfully' })
			return req.HELPER.sendResponse(res, 201, response)
		} catch (err) {
			let response = { errors: req.HELPER.getServerError(CONST[500]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 500, resarr);
		}

	} catch (err) {
		let response = { errors: req.HELPER.getServerError(CONST[500]) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr);
	}
})

//create password
router.post(CONST.POST_CREATE_PASS, async (req, res) => {

	let { token: userToken, password, confirmPassword } = req.body

	const schema = Joi.object({
		password: Joi.string()
			.min(8)
			.max(15)
			.required(),
		confirmPassword: Joi.ref('password'),
		token: Joi.string().required()
	}).with('password', 'confirmPassword')

	let { error, value } = await schema.validate(req.body, { abortEarly: false });
	if (error) {
		let response = { errors: req.HELPER.getValidationError(error) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 422, resarr);
	}

	try {
		let doc = await User.findOne({ "forgotPassword.token": userToken })
		if (!doc) {
			let response = { errors: req.HELPER.getServerError(CONST[404]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 404, resarr)
		}
		if (doc.isDeleted) {
			let response = { errors: req.HELPER.getServerError(CONST[405]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 405, resarr)
		}

		//check static
		if (!doc.forgotPassword && (doc.forgotPassword.otp === 0000)) {
			let response = { errors: req.HELPER.getServerError(CONST[400]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 400, resarr)
		}
		//Upadet fields 	
		doc.password = password
		doc.forgotPassword = {}
		//login token
		const newtoken = jwt.sign({ sub: doc._id }, JWT_SECRET);
		doc.token = [newtoken]
		try {
			await doc.save();
			let response = req.HELPER.getResponse({ success: true, data: [{ token: newtoken }], message: 'password created successfully' })
			return req.HELPER.sendResponse(res, 201, response)
		} catch (err) {
			let response = { errors: req.HELPER.getServerError(CONST[500]) };
			let resarr = req.HELPER.getResponse(response);
			return req.HELPER.sendResponse(res, 500, resarr);
		}

	} catch (err) {
		let response = { errors: req.HELPER.getServerError(CONST[500]) };
		let resarr = req.HELPER.getResponse(response);
		return req.HELPER.sendResponse(res, 500, resarr);
	}
})

/******************* SOCIAL LOGIN  *************/
router.get('/fb', async (req, res, next) => {

	// console.log(req)

	// passport.authenticate('local', { session: false }, async (err, user, info) => {
	// 	if (err) {
	// 		let response = req.HELPER.getResponse({ errors: req.HELPER.getServerError(err) })
	// 		return res.status(500).send(response);

	// 	}
	// 	if (!user) {
	// 		let response = req.HELPER.getResponse(info)
	// 		return res.status(500).send(response);
	// 	}

	// 	const token = jwt.sign({ sub: user._id }, JWT_SECRET);
	// 	let u = await User.updateOne(
	// 		{ _id: user._id },
	// 		{ $addToSet: { token: token } }
	// 	)
	// 	let response = req.HELPER.getResponse({ success: true, data: [{ token }] })
	// 	return res.status(201).send(response);
	// })(req, res, next);
	try {
		passport.authenticate('facebook', { scope: ['email', 'public_profile'] }, async (err, user, info) => {

			console.log(err)
			console.log(user)
			console.log(info)
			return res.send(user)
		})(req, res, next);

	} catch (error) {

	}

})
router.get('/fb/cb', async (req, res, next) => {

	passport.authenticate('facebook', { successRedirect: '/getlist', failureRedirect: '/login' }, (req, res) => {

		console.log(req.body)

		return res.send(req)
	})
	// 	res.redirect(req.session.returnTo || '/');
	// })


})


// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
// 	res.redirect(req.session.returnTo || '/');
// });


module.exports = router
