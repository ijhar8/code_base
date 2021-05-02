const listData = async (doc, filter) => {

	let { page = 0, limit = 10, sort = 1, sortby = `createdAt`, where = {} } = filter

	const BOOLENTYPE = ['isDeleted']
	/*search filters */
	let search = {}
	for (const cloumn in where) {
		if (where.hasOwnProperty(cloumn) && where[cloumn]) {

			if (BOOLENTYPE.includes(cloumn) && typeof where[cloumn] === Boolean)
				search[cloumn] = where[cloumn];
			else
				search[cloumn] = { '$regex': where[cloumn], '$options': 'i' }

		}
	}

	/*code for pagination start */
	limit = parseInt(limit)
	page = parseInt(page)
	page = limit * (page - 1)
	page = page < 1 ? 0 : page//negative values can break skip

	let data = []
	try {
		data = await doc.find(search)    // find all users with filter
			.skip(page)                  // skip the first n items 
			.limit(limit)                // limit to n items
			.sort({ [sortby]: sort })    // sort asc/dsc by createdAt


		let totalCount = await doc.countDocuments(search)
		let totalPages = Math.ceil(totalCount / limit)

		return {
			data: data,
			pages: totalPages,
			totalCount,
			success: true,
			errors: [],
			message: ""
		};

	} catch (error) {
		// console.log(error)
		return {
			success: false,
			message: error.toString(),
			description: `error while fetching data please check data and data type`
		}
	}

}
module.exports = { listData }