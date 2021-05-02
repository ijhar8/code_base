var express = require('express')
var router = express.Router()
const User = require('../models/User');
const Student = require('../models/Student');

var guard = require('express-jwt-permissions')({
    requestProperty: 'user_permissions',
    permissionsProperty: 'permissions'
})
const Joi = require('@hapi/joi');
const { listData } = require('../helper/h_model');
const { Role } = require('../models/Permission')
const { ...CONST } = require('../helper/app_helper/h_constant');



router.get(CONST.GET_LIST, guard.check(CONST.GET_STUDENTS_ACL), async (req, res) => {

    let data = await listData(Student, req.query);
    if (data.success === false) {
        let errresponse = { errors: req.HELPER.getServerError(data.message), message: data.description };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 400, resarr)
    }
    return req.HELPER.sendResponse(res, 200, data)

})



router.post(CONST.POST_CREATE, guard.check(CONST.POST_CREATE_STUDENT_ACL), async (req, res) => {

    const { name, class: classST } = req.body
    let schema = Joi.object({
        name: Joi.string()
            .required(),
        class: Joi.string()
            .required()

    })

    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {

        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
    }
    const student = new Student({
        name: name,
        class: classST,

    });
    try {
        const result = await student.save();
        let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'student created successfully' });
        return req.HELPER.sendResponse(res, 201, resarr)
    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(err) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})

router.post(CONST.POST_ADD, guard.check(CONST.POST_ADD_STUDENT_ACL), async (req, res) => {

    let { sub: createdBy } = res.jwt_payload

    const { name, class: classST } = req.body
    let schema = Joi.object({
        name: Joi.string()
            .required(),
        class: Joi.string()
            .required()

    })

    let { error, value } = await schema.validate(req.body, { abortEarly: false });
    if (error) {

        let errresponse = { errors: req.HELPER.getValidationError(error) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 422, resarr)
    }
    const student = new Student({
        name: name,
        class: classST,
        createdBy

    });
    try {
        const result = await student.save();
        let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'student created successfully' });
        return req.HELPER.sendResponse(res, 201, resarr)
    } catch (err) {
        let errresponse = { errors: req.HELPER.getServerError(err) };
        let resarr = req.HELPER.getResponse(errresponse);
        return req.HELPER.sendResponse(res, 500, resarr)
    }
})

router.post(CONST.POST_UPDATE, guard.check(CONST.POST_UPDATE_STUDENT_ACL), async (req, res) => {

    let { name, _id, class: stclass } = req.body
    let { sub: updatedBy } = res.jwt_payload

    let schema = Joi.object({
        name: Joi.string()
            .required(),
        _id: Joi.string()
            .required(),
        class: Joi.string()
            .required(),

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
        let doc = await Student.findOne({ _id: _id })
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
        doc.name = name
        doc.class = stclass
        doc.updatedBy = updatedBy
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'role updated successfully' });
            return req.HELPER.sendResponse(res, 201, resarr)
        } catch (err) {
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

router.delete(CONST.DELETE_DELETE, guard.check(CONST.DELETE_STUDENT_ACL), async (req, res) => {

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
        let doc = await Student.findOne({ _id: _id })
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
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'student deleted successfully' });
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


router.post(CONST.POST_RESTORE, guard.check(CONST.POST_RESTORE_STUDENT_ACL), async (req, res) => {

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
        let doc = await Student.findOne({ _id: _id })
        if (!doc) {
            let response = { errors: req.HELPER.getServerError(CONST[404]) };
            let resarr = req.HELPER.getResponse(response);
            return req.HELPER.sendResponse(res, 404, resarr)
        }
        doc.isDeleted = false
        doc.updatedBy = updatedBy
        try {
            const result = await doc.save();
            let resarr = req.HELPER.getResponse({ success: true, data: [result], message: 'student restored successfully' });
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

router.get(CONST.GET_VIEW, guard.check(CONST.GET_STUDENT_ACL), async (req, res) => {

    let { _id } = req.query
    let schema = Joi.object({
        _id: Joi.string()
            .required(),
        token: Joi.string()
    })

    let { error, value } = await schema.validate(req.query, { abortEarly: false });
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
        let doc = await Student.findOne({ _id: _id })
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
