const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const studentSchema = new mongoose.Schema({

    name: String,
    class: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    number: Number,
    createdBy: {
        type: String,
        default: `-`
    },
    updatedBy: {
        type: String,
        default: `-`
    }
}, { timestamps: true });

const Student = mongoose.model('Students', studentSchema);

module.exports = Student;