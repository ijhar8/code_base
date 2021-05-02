const mongoose = require('mongoose');

/************ 1 permissionSchema******************/
const permissionSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

permissionSchema.statics.getPermissionsByID = async function getPermissionsByID(IDsarray) {

  let arr = await this.find({ _id: IDsarray }, { name: 1, _id: 0 })

  return arr;

}


const Permission = mongoose.model('Permission', permissionSchema);

/************ 2 Role ******************/
const roleSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  permissions: Array,
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: `-`
  },
  updatedBy: {
    type: String,
    default: `-`
  }
}, { timestamps: true });


roleSchema.statics.getPermissionsByRoles = async function getPermissionsByRoles(IDsarray) {

  let arr = await this.find({ _id: IDsarray, isDeleted: false })

  return arr;

}

const Role = mongoose.model('Role', roleSchema);







module.exports = { Permission, Role };