const jwt = require('jsonwebtoken');

const { getConfig } = require('../helper/app_helper/h_config');
const { getPermissionsByID } = require('../helper/h_permission');
const { ...HELPER } = require('../helper/h_util');
const { ...CONST } = require('../helper/app_helper/h_constant');
const User = require('../models/User')



const excludePaths = CONST.EXCLUDEJWTAUTH


async function userPayload(req, res, next) {

	const pathCheck = excludePaths.some(path => path === req.path);
	//without token payload
	req[`HELPER`] = HELPER
	req[`user_permissions`] = { permissions: [] }

	if (pathCheck)
		next();
	else {

		const JWT_SECRET = getConfig(`APP.JWT_SECRET`);
		let token = req.query.token || req.headers.bearer

		if (token) {

			let payload = await jwt.verify(token, JWT_SECRET);

			if (!HELPER.isValidID(payload.sub)) {
				let response = { errors: HELPER.getServerError("not valid id") };
				let resarr = HELPER.getResponse(response);
				return HELPER.sendResponse(res, 301, resarr);
			}
			let permissions = []
			try {

				let doc = await User.findOne({ _id: payload.sub, token: token })
				if (!doc) {
					let response = { errors: HELPER.getServerError(CONST[402]) };
					let resarr = HELPER.getResponse(response);
					return HELPER.sendResponse(res, 401, resarr)
				}
				permissions = await getPermissionsByID(payload.sub);

			} catch (error) {
				if (!doc) {
					let response = { errors: HELPER.getServerError(CONST[500]) };
					let resarr = HELPER.getResponse(response);
					return HELPER.sendResponse(res, 500, resarr)
				}
			}
			// console.log(permissions)
			//with token payload
			res[`jwt_payload`] = payload
			res[`TOKEN`] = token
			req[`user_permissions`] = { permissions }
			next();
		}
		else {

			let response = { errors: req.HELPER.getServerError(CONST[500]) };
			let resarr = req.HELPER.getResponse(response);
			return HELPER.sendResponse(res, 500, resarr)
		}
	}
}
module.exports = userPayload;

/****
 extact user id and permissions assign it to each request for use in end point
 assigng helpers for request
****/