var express = require('express')
var router = express.Router()
const User = require('../models/User')
const jwt = require('jsonwebtoken');
const { getConfig } = require('../helper/app_helper/h_config');
const JWT_SECRET = getConfig(`APP.JWT_SECRET`);
var guard = require('express-jwt-permissions')({
    requestProperty: 'user_permissions',
    permissionsProperty: 'permissions'
})
const Joi = require('@hapi/joi');
const { listData } = require('../helper/h_model');
const { Role } = require('../models/Permission')
const { ...CONST } = require('../helper/app_helper/h_constant');



router.get(CONST.GET_USERS, async (req, res) => {

    let data = await listData(User, req.query);
    if (data.success === false) {
        let errresponse = { errors: req.HELPER.getServerError(data.message), message: data.description };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 400, resarr)
    }
    return req.HELPER.sendResponse(res, 200, data)

})

router.post(CONST.POST_CREATE, async (req, res) => {

    let schema = getCreateValidation();

    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {

        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
    }
    User.findOne({ email: req.body.email,}, async (err, existingUser) => {
        if (err) {
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr);
        }
        if (existingUser) {
            let errresponse = { errors: req.HELPER.getServerError(`user ${req.body.email} already exists`) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 409, resarr);
        }

       const empUniq=await User.count({ employeeId: req.body.employeeId });
       if (empUniq) {
        let errresponse = { errors: req.HELPER.getServerError(`employeeId  already exists`) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 409, resarr);
       }
   
       const empOrgUniq=await User.count({ employeeOrgnization: req.body.employeeOrgnization });
       if (empOrgUniq) {
        let errresponse = { errors: req.HELPER.getServerError(`employeeOrgnization  already exists`) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 409, resarr);
       }
   
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            employeeId:req.body.employeeId,
            employeeOrgnization:req.body.employeeOrgnization,
            roles:["5e283f86946f7a2a7476fc5c"]//static admin remove for dynamic
       });
        // 5e283f86946f7a2a7476fc5c
        try {
            const result = await user.save();
            const token = await jwt.sign({ sub: result._id }, JWT_SECRET);
            let resarr = req.HELPER.getResponse({ success: true, data: [{ token }], message: 'User created successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            console.log(err)
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr);
        }
    });
})

router.post(CONST.POST_ADD, guard.check(CONST.POST_ADDUSER_ACL), async (req, res) => {

    let { sub: createdBy } = res.jwt_payload
    let schema = getCreateValidation();

    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {

        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
    }
    User.findOne({ email: req.body.email }, async (err, existingUser) => {
        if (err) {
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr);
        }
        if (existingUser) {
            let errresponse = { errors: req.HELPER.getServerError(`user ${req.body.email} already exists`) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 409, resarr);
        }
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            createdBy
        });
        try {
            const result = await user.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'User added successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr);
        }
    });
})

router.post(CONST.POST_UPDATE, guard.check(CONST.POST_UPDATE_USER_ACL), async (req, res) => {

    let { email, _id } = req.body
    let { sub: updatedBy } = res.jwt_payload
    // console.log(err)

    let schema = Joi.object({
        email: Joi.string()
            .email()
            .required(),
        _id: Joi.string()
            .required()

    })
    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {
        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
    }
    if (!req.HELPER.isValidID(_id)) {
        let response = { errors: req.HELPER.getServerError("not valid id") };
        let resarr = req.HELPER.getResponse(response);
        return req.HELPER.sendResponse(res, 301, resarr);
    }


    try {
        let existingUser = await User.findOne({ email: email })
        if (existingUser) {
            let errresponse = { errors: req.HELPER.getServerError(`user ${email} already exists`) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 409, resarr);
        }
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
        //Upadet fields 
        doc.email = email
        doc.updatedBy = updatedBy
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'user updated successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            // console.log(err)

            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr);
        }
    } catch (err) {
        // console.log(err)
        let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})

router.delete(CONST.DELETE_DELETE, guard.check(CONST.DELETE_USER_ACL), async (req, res) => {

    let { _id } = req.query
    let { sub: updatedBy } = res.jwt_payload
    let schema = Joi.object({
        _id: Joi.string()
            .required()
    })

    let { error, value } = await schema.validate({ _id }, { abortEarly: false });
    if (error) {
        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
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
        doc.isDeleted = true
        doc.updatedBy = updatedBy
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'user deleted successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr)
        }
    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})


router.post(CONST.POST_RESTORE, guard.check(CONST.POST_RESTORE_USER_ACL), async (req, res) => {

    let { _id } = req.body
    let { sub: updatedBy } = res.jwt_payload
    let schema = Joi.object({
        _id: Joi.string()
            .required()
    })
    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {
        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
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
        doc.isDeleted = false
        doc.updatedBy = updatedBy
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'user restored successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr)
        }
    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }

})

router.get(CONST.GET_VIEW, guard.check(CONST.GET_USER_ACL), async (req, res) => {

    let { _id } = req.query
    let schema = Joi.object({
        _id: Joi.string()
            .required()
    })

    let { error, value } = await schema.validate({ _id }, { abortEarly: false });
    if (error) {
        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
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
        let resarr = req.HELPER.getResponse({ success: true, data: [doc] });
        return req.HELPER.sendResponse(res, 201, resarr)
    } catch (err) {
        let response = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(response);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})


router.get(CONST.GET_USER_ROLE, guard.check([CONST.GET_USER_ROLE_ACL]), async (req, res) => {

    let { _id } = req.query

    let schema = Joi.object({
        _id: Joi.string()
            .required()
    })

    let { error, value } = await schema.validate({ _id }, { abortEarly: false });
    if (error) {
        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
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
        let permissionsByRoles = await Role.getPermissionsByRoles(doc.roles)
        let resarr = req.HELPER.getResponse({ success: true, data: permissionsByRoles });
        return req.HELPER.sendResponse(res, 201, resarr)
    } catch (err) {
        let response = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(response);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})

router.post(CONST.POST_USER_ROLE, guard.check(CONST.POST_USER_ROLE_ACL), async (req, res) => {

    let { roles, _id } = req.body

    let schema = Joi.object({
        roles: Joi.array()
            .required(),
        _id: Joi.string()
            .required()
    })


    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {
        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
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
        //Upadet fields 
        doc.roles = roles
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'updated user role successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr)
        }
    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})




let getCreateValidation = () => {
    const schema = Joi.object({

        password: Joi.string()
            .min(8)
            .max(15)
            .required(),
        confirmPassword: Joi.ref('password'),
        email: Joi.string()
            .email()
            .required(),
        firstName: Joi.string()
        .required(),
        lastName: Joi.string()
        .required(),
        employeeId: Joi.string()
        .required(),
        employeeOrgnization: Joi.string()
        .required()
         
    }).with('password', 'confirmPassword')

    return schema;
}

module.exports = router
