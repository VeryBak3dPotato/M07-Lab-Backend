const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://ambsprad:255Password@courses.hkgtw.mongodb.net/?retryWrites=true&w=majority&appName=Courses",
{useNewURLParser: true, useUnifiedTopology: true})

module.exports = mongoose