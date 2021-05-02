var express = require('express')
var router = express.Router()
const { Permission, Role } = require('../models/Permission')
var guard = require('express-jwt-permissions')({
    requestProperty: 'user_permissions',
    permissionsProperty: 'permissions'
})
const Joi = require('@hapi/joi');
const { listData } = require('../helper/h_model');
const { ...CONST } = require('../helper/app_helper/h_constant');


/******All Permissions******/
router.get(CONST.GET_PERMISSIONS, guard.check(CONST.GET_PERMISSIONS_ACL), async (req, res) => {

    let data = await listData(Permission, req.query);
    if (data.success === false) {
        let errresponse = { errors: req.HELPER.getServerError(data.message), message: data.description };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 400, resarr)
    }
    return req.HELPER.sendResponse(res, 200, data)

})

/******ROLE******/
router.get(CONST.GET_ROLES, guard.check(CONST.GET_ROLES_ACL), async (req, res) => {
    let data = await listData(Role, req.query);
    if (data.success === false) {
        let errresponse = { errors: req.HELPER.getServerError(data.message), message: data.description };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
    return req.HELPER.sendResponse(res, 200, data)
})

router.post(CONST.POST_CREATE, guard.check(CONST.POST_CREATE_ROLE_ACL), async (req, res) => {

    let { sub: createdBy } = res.jwt_payload
    let { name, permissions } = req.body

    let schema = Joi.object({
        name: Joi.string()
            .required(),
        permissions: Joi.array()
            .required()
    })

    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {

        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
    }
    const role = new Role({
        name: name,
        permissions: permissions,
        createdBy
    });

    let existingName = await Role.findOne({ name: name })
    if (existingName) {
        let errresponse = { errors: req.HELPER.getServerError(`Role name ${name} already exists`) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 409, resarr);
    }

    try {
        const result = await role.save();
        let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'role created successfully' });
        return req.HELPER.sendResponse(res, 201, resarr)
    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(err) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})

router.post(CONST.POST_UPDATE, guard.check(CONST.POST_UPDATE_ROLE_ACL), async (req, res) => {

    let { name, _id, permissions } = req.body
    let { sub: updatedBy } = res.jwt_payload
    let schema = Joi.object({
        name: Joi.string()
            .required(),
        permissions: Joi.array()
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

        let doc = await Role.findOne({ _id: _id })
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
        doc.name = name
        doc.permissions = permissions
        doc.updatedBy = updatedBy

        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'role updated successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
            // console.log(err)
            let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
            let resarr = req.HELPER.getResponse(errresponse);
            return req.HELPER.sendResponse(res, 500, resarr);
        }

    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(CONST[500]) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})

router.delete(CONST.DELETE_DELETE, guard.check(CONST.DELETE_ROLE_ACL), async (req, res) => {

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
        let doc = await Role.findOne({ _id: _id })
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
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'role deleted successfully' });
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


router.post(CONST.POST_RESTORE, guard.check(CONST.POST_RESTORE_ROLE_ACL), async (req, res) => {

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
        let doc = await Role.findOne({ _id: _id })
        if (!doc) {
            let response = { errors: req.HELPER.getServerError(CONST[404]) };
            let resarr = req.HELPER.getResponse(response);
            return req.HELPER.sendResponse(res, 404, resarr)
        }
        doc.isDeleted = false
        doc.updatedBy = updatedBy
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'role restored successfully' });
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

router.get(CONST.GET_VIEW, guard.check(CONST.GET_ROLE_ACL), async (req, res) => {

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
        let doc = await Role.findOne({ _id: _id })
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

module.exports = router
