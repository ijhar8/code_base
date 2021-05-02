const { ...HELPER } = require('./h_util');
const User = require('../models/User');
const { Role } = require('../models/Permission');
const { Permission } = require('../models/Permission');



const getPermissionsByID = async (userID) => {

    try {


        // let doc = await User.findOne({ _id: userID })
        // console.log(doc)

        if (!doc)
            return []
        let permissionsIDS = await getPermissionsByRoles(doc.roles)

        let idArr = permissionsIDS.filter(x => HELPER.isValidID(x))
        // console.log(permissionsIDS)

        let arr = await Permission.getPermissionsByID(idArr)
        let permissions = arr.map(e => e.name)

        return [...new Set([...permissions])]


    } catch (error) {
        // console.log(error)
        throw ('error while fetching user permissions')
    }


}

// const getPermissionsNamesByID = async (userID) => {

//     try {


//         let doc = await User.findOne({ _id: userID })

//         if (!doc)
//             return []

//         // let b = await db.users.aggregate([
//         //     { $match: { _id: userID } },
//         //     { $unwind: "$roles" },
//         //     { $lookup: { from: "roles", localField: "roles", foreignField: "_id", as: "rl" } },
//         //     { $unwind: "$rl.permissions" },
//         //     { $lookup: { from: "permissions", localField: "name", foreignField: "_id", as: "pm" } }


//         let permissions = await getPermissionsByRoles(doc.roles)
//         console.log(permissions)
//         console.log(`permissions`)

//         let arr = await Permissions.getPermissionsByID(permissions)
//         console.log(arr)
//         console.log(`arr`)


//         return arr;

//     } catch (error) {

//         throw ('error while fetching user permissions')
//     }


// }



const getPermissionsByRoles = async (roles) => {

    let rolesArr = await Role.getPermissionsByRoles(roles)

    let result = [];
    rolesArr.map((role) => {

        result = [...result, ...role.permissions]

    })

    return [...new Set([...result])]

}

const checkPermission = (permissionsArr) => {

}


module.exports = {
    getPermissionsByID
}