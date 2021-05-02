
const { ...HELPER } = require('../helper/h_util');
const { ...CONST } = require('../helper/app_helper/h_constant');

function errorHandler(err, req, res, next) {

    // console.log(res.body)
    // if(typeof(err)=='Object'){
    //     return res.status(400).send({ msg: 'Access Forbidden' });
    // }
    // if (typeof (err) === 'string') {
    //     // custom application error
    //     // return res.status(400).json({ message: err });
    // }

    if (err.code === 'permission_denied') {
        //express-jwt-permissions error

        let errresponse = { errors: req.HELPER.getServerError(CONST[403]) };
        let resarr = HELPER.getResponse(errresponse);
        return HELPER.sendResponse(res, 403, resarr)
    }

    if (err.name === 'UnauthorizedError') {
        // jwt authentication error
        let errresponse = { errors: HELPER.getServerError(CONST[401]) };
        let resarr = HELPER.getResponse(errresponse);
        return HELPER.sendResponse(res, 401, resarr)
    }


    // default to 500 server error

    let errresponse = { errors: HELPER.getServerError(CONST[500]) };
    let resarr = HELPER.getResponse(errresponse);
    return HELPER.sendResponse(res, 500, resarr)

}
module.exports = errorHandler;


/****
The global error handler is used catch all errors
and remove the need for redundant error handler code throughout the application.
It's configured as middleware in the main App.js file.
****/