const db = require("../db")

const Course = db.model("Course", {
    name: {type:String, required:true},
    subjectArea: {type:String, required:true},
    creditHours: {type:Number, min:1, max:6},
    courseDesc: String
})

module.exports = Course