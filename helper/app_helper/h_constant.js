const BASE = {
    APIBASE: 'http://localhost:8888'
}
const ASSETPATH = {

    LOGOPATH: '/public/images/logo.png',
    EXCLUDEJWTAUTH: [
        '/auth/login',
        '/auth/fb',
        '/auth/fb/cb',
        '/auth/forgotpassword',
        '/auth/submitotp',
        '/auth/createpassword',
        '/user/create',
        '/user/users',
        '/graphql'

    ]//routes that don't require authentication

}

const APIURL = {

    GET_USERS: '/users',
    POST_LOGIN: '/login',
    GET_LOGOUT: '/logout',
    GET_LOGOUT_ALL: '/logoutall',
    POST_UPDATE_PASS: '/changepassword',
    POST_FORGOT_PASS: '/forgotpassword',
    POST_SUBMIT_OTP: '/submitotp',
    POST_CREATE_PASS: '/createpassword',
    GET_PERMISSIONS: '/permissions',
    GET_ROLES: '/roles',
    GET_LIST: '/list',
    GET_VIEW: '/view',
    POST_CREATE: '/create',
    POST_UPDATE: '/update',
    DELETE_DELETE: '/delete',
    POST_RESTORE: '/restore',
    POST_ADD: '/add',
    GET_USER_ROLE: '/viewuserrole',
    POST_USER_ROLE: '/updateuserrole',

}
const API_PERMISSIONS = {

    GET_USERS_ACL: ['view_users'],
    GET_PERMISSIONS_ACL: ['view_permissions'],
    GET_ROLES_ACL: ['view_roles'],
    GET_ROLE_ACL: ['view_role'],
    POST_ADDUSER_ACL: ['add_user'],
    POST_UPDATE_USER_ACL: ['update_user'],
    DELETE_USER_ACL: ['delete_user'],
    POST_RESTORE_USER_ACL: ['restore_user'],
    GET_USER_ACL: ['view_user'],
    POST_CREATE_ROLE_ACL: ['create_role'],
    POST_UPDATE_ROLE_ACL: ['update_role'],
    DELETE_ROLE_ACL: ['delete_role'],
    POST_RESTORE_ROLE_ACL: ['restore_role'],
    GET_USER_ROLE_ACL: ['view_user_role'],
    POST_USER_ROLE_ACL: ['update_user_role'],

    //modules

    GET_STUDENTS_ACL: ['view_students'],
    GET_STUDENT_ACL: ['view_student'],
    POST_CREATE_STUDENT_ACL: ['create_student'],
    POST_ADD_STUDENT_ACL: ['add_student'],
    POST_UPDATE_STUDENT_ACL: ['update_student'],
    DELETE_STUDENT_ACL: ['delete_student'],
    POST_RESTORE_STUDENT_ACL: ['restore_student']

}
const ERRORMSG = {

    "422": "Unprocessable Entity",
    "500": "Internal Server Error",
    "201": "ok",//post
    "200": "ok",//get
    "409": "Conflict",
    "400": "bad request ",
    "401": "unauthorized user",
    "404": "resource not found",
    "405": "resource not active",
    "204": "resource deleted successfully",
    "403": "dont have permission"
}





const ALLPATH = { ...BASE, ...ASSETPATH, ...APIURL, ...API_PERMISSIONS, ...ERRORMSG }

// const getConstant = (key = null) => {

//     if (key)
//         return ALLPATH[key]
//     else
//         return ALLPATH

// }

module.exports = ALLPATH