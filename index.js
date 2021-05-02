const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
var cors = require('cors')
const { getConfig } = require('./helper/app_helper/h_config');
const { getConstant } = require('./helper/app_helper/h_constant');
const routes = require('./routes/route.js');
const JWTauthentication = require('./middlewares/jwt');
const errorHandler = require('./middlewares/error-handler');
const userPayload = require('./middlewares/user-payload');
const { schema } = require('./graphql');
const { ApolloServer } = require('apollo-server-express');

/****** Config Constant *****/
const PORT = process.env.PORT || 3000 //heroku auto port
// const PORT = getConfig(`APP.port`) || 5000//defined port

const DB_URI = getConfig(`DB.uri`);


/****** App Init *****/
app.use(passport.initialize());
require('./config/passport.js');

/****** Middleware *******/
app.use(helmet())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {

  res.header("Access-Control-Allow-Origin", '*');
  //res.header("Access-Control-Allow-Origin",'https://development3.insightguru.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cors({ credentials: true, origin: 'https://nifty-bardeen-fab63f.netlify.com' }));

app.options('*', cors());
// app.use(cors())

// use JWT auth to secure the api
app.use(JWTauthentication());
//set payload from JWT except on some points
app.use(userPayload)


/****** Database connection *******/
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(DB_URI);
mongoose.connection.on('error', (err) => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

// private GraphQL API
// app.use('/graphql', (req, res, next) => next());

// const graphQLServer = new ApolloServer({
//   schema,
   
// });

// graphQLServer.start();
// graphQLServer.applyMiddleware({
//   app: app,
//   cors: {
//     origin: true,
//     credentials: true,
//     methods: ['POST'],
//     allowedHeaders: [
//       'X-Requested-With',
//       'X-HTTP-Method-Override',
//       'Content-Type',
//       'Accept',
//       'Authorization',
//       'Access-Control-Allow-Origin',
//     ],
//   },
//   playground: {
//     settings: {
//       'editor.theme': 'light',
//     },
//   },
// });

/****** Routes *******/
app.use('/', routes)


//  graphQLServer.start();
// global error handler
app.use(errorHandler);



/*** Express configuration. */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use((req, res, next) => {
  next()
})


app.listen(PORT, () => console.log(`Example app id listening on port ${PORT}!`));