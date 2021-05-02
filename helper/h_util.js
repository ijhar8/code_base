const isValidID = (id) => {
	// console.log(id)
	// console.log(`d`)
	return id.match(/^[0-9a-fA-F]{24}$/)

}
const getResponse = (obj) => {

	const { success = false, data = [], errors = [], message = "" } = obj
	return {

		success: success,
		data: data,
		errors: errors,
		message: message

	}

}

const getValidationError = (err) => {

	let errors = err.details.map((error) => {


		return {
			message: error.message || null,
			key: error.context.key || null,
			value: error.context.value || null
		}
	})

	return errors;

}

const getServerError = (message, key = null, value = null) => {


	return [{
		message,
		key,
		value
	}]
}

const sendResponse = (res, status, data, options = {}) => {
	// console.log(res)
	// console.log(`res`)

	let permissions = res.user_permissions && res.user_permissions.permissions
	data['permissions'] = permissions || []

	return res.status(status).send(data);
}
module.exports = {
	isValidID,
	getResponse,
	getValidationError,
	getServerError,
	sendResponse
}