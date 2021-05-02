const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');



const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  isDeleted: {
    type: Boolean,
    default: false
  },
  firstName:String,
  lastName:String,
  employeeId:{ type: String, unique: true },
  employeeOrgnization:{ type: String, unique: true },
  roles: Array,
  createdBy: {
    type: String,
    default: `-`
  },
  token: Array,
  forgotPassword: {
    token: String,
    otp: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }

  },
  updatedBy: {
    type: String,
    default: `-`
  }
}, { timestamps: true });

/***  Password hash middleware.***/
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }


  bcrypt.genSalt(10, function (err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, function (err, hash) {
      // Store hash in your password DB.
      if (err) { return next(err); }
      user.password = hash;
      next();

    });
  });

});



/***  Helper method for validating user's password.***/
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};



/*** get users not in use ***/
userSchema.statics.getUsers = async function getUsers(query) {


  let { page = 1, limit = 10, sort = 1, sortby = `createdAt`, where = {} } = query

  /*search filters */
  let search = { isDeleted: false }
  for (const cloumn in where) {

    if (where.hasOwnProperty(cloumn) && where[cloumn]) {

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
    data = await this.find(search)                 // find all users with filter
      .skip(page)                  // skip the first n items 
      .limit(limit)                // limit to n items
      .sort({ [sortby]: sort })       // sort asc/dsc by createdAt

  } catch (error) {

    return {
      success: false,
      msg: error.toString()

    }

  }
  let totalCount = await this.countDocuments({ isDeleted: false })
  let totalPages = Math.ceil(totalCount / limit)

  return {
    users: data,
    pages: totalPages,
    totalCount,
    success: true
  };

};



const User = mongoose.model('Users', userSchema);

module.exports = User;