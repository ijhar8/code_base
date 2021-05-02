const expressJwt = require('express-jwt');
const { getConfig } = require('../helper/app_helper/h_config');
const { getConstant } = require('../helper/app_helper/h_constant');
const JWT_SECRET = getConfig(`APP.JWT_SECRET`);
const { ...CONST } = require('../helper/app_helper/h_constant');


function JWTauthentication() {
  return expressJwt({ secret: JWT_SECRET, getToken: fromHeaderOrQuerystring }).unless({
    path: CONST.EXCLUDEJWTAUTH
  });
}

function fromHeaderOrQuerystring(req) {

  if (req.headers.bearer && req.headers.bearer.length > 1) {
    return req.headers.bearer
  } else if (req.query && req.query.token && req.query.token.length > 1) {
    return req.query.token;
  }
  return null;
}

module.exports = JWTauthentication;

/**
 The node JWT middleware checks that
 the JWT token received in the http request from the client is valid before allowing access to the API,
  if the token is invalid a "401 Unauthorized" response is sent to the client.
 **/