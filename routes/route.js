var express = require('express')
const app = express();
const helmet = require('helmet');

// controller imports
var User = require('../controllers/User');
var Student = require('../controllers/Students');
const AuthController = require('../controllers/AuthController');
const PermissionController = require('../controllers/PermissionController');


// middleware for router
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.7' }));



// define the Admin  routes
app.use('/user', User)
app.use('/auth', AuthController);
app.use('/acl', PermissionController);


//modules
app.use('/student', Student)


//400
app.use('/', (req, res) => {
   return res.send("invalid")
})

module.exports = app