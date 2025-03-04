////////////////////////////// SETUP //////////////////////////////

const express =  require("express");
// we have to use cors in order to host a front end and backend on the same device
var cors = require('cors')

// const bodyParser = require('body-parser')
const jwt = require("jwt-simple")
const Course = require("./models/course")
const User = require("./models/users")
const app = express();
app.use(cors());

app.use(express.json())
const router = express.Router();
const secret = "mysupersecret";




////////////////////////////// MIDDLEWARE //////////////////////////////

const isTeacher = async (req, res, next) => {
    if (!req.headers["x-auth"]) {
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        const user = await User.findOne({username: decoded.username});
        if (user.type !== "Teacher") {
            return res.status(403).json({error: "Forbidden: Requires Teacher role"});
        }
        next();
    } catch (ex) {
        res.status(401).json({error: "Invalid JWT"});
    }
};

const isStudent = async (req, res, next) => {
    if (!req.headers["x-auth"]) {
        return res.status(401).json({error: "Missing X-Auth header"});
    }
    const token = req.headers["x-auth"];
    try {
        const decoded = jwt.decode(token, secret);
        const user = await User.findOne({username: decoded.username});
        if (user.type !== "Student") {
            return res.status(403).json({error: "Forbidden: Requires Student role"});
        }
        next();
    } catch (ex) {
        res.status(401).json({error: "Invalid JWT"});
    }
};




////////////////////////////// USERS //////////////////////////////

// Create a new student user
router.post("/user", async (req, res) => {
   if (!req.body.username || !req.body.password) {
       res.status(400).json({error: "Missing username or password"});
   }
   const newUser = await new User({
       username: req.body.username,
       password: req.body.password,
       type: "Student"
   });
   try {
       await newUser.save();
       res.sendStatus(201);
   } catch {
       res.status(400).json({error: "Username already exists"});
   }
});

// User Login
router.post("/auth", async (req, res) => {
   if (!req.body.username || !req.body.password) {
       res.status(400).json({error: "Missing username or password"});
       return
   }
   let user = await User.findOne({username: req.body.username});
   try{
       if (!user) {
           res.status(400).send(err); 
       } else if (!user) {
           res.status(401).json({error: "User not found"});
       } else {
           if (user.password != req.body.password) {
               res.status(401).json({error: "Incorrect password"});
           } else {
               username2 = user.username;
               const token = jwt.encode({username: user.username}, secret);
               const auth = 1;
               res.json({
                   username2,
                   token:token,
                   auth:auth
               });
           }
       }
   } catch (err) {
       res.status(400).json({error: "User not found"});
   }
});

// Check user status by token
router.get("/status", async (req, res) => {
   if (!req.headers["x-auth"]) {
       return res.status(401).json({error: "Missing X-Auth header"});
   }
   const token = req.headers["x-auth"];
   try {
       const decoded = jwt.decode(token, secret);
       let users = User.find({}, "username status");
       res.json(users);
   } catch (ex) {
       res.status(401).json({error: "Invalid JWT"});
   }
});




////////////////////////////// COURSES //////////////////////////////

// Grab all courses
router.get("/courses", async(req,res) =>{
   try{
      const courses = await Course.find({})
      res.send(courses)
      console.log(courses)
   }
   catch (err){
      console.log(err)
   }
});

// Get course by id
router.get("/courses/:id", async (req, res) => {
   try {
      const courses = await Course.findById(req.params.id);
      res.json(courses);
   } catch(err) {
      res.status(400).send(err);
   }
});

// Create a new course
router.post("/courses", async (req,res) =>{
    try{
        const course = await new Course(req.body)
        await course.save()
        res.status(201).json(course)
        console.log(course)
    }
    catch(err){
        res.status(400).send(err)
    }
});

// Edit a course
router.put("/courses/:id", isTeacher, async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(course);
    } catch(err) {
        res.status(400).send(err);
    }
});

// Add a course to student's course list (only students can add courses to their list)
router.post("/courses/:id/add", isStudent, async (req, res) => {
    try {
        const token = req.headers["x-auth"];
        const decoded = jwt.decode(token, secret);
        const user = await User.findOne({username: decoded.username});
        user.courses.push(req.params.id);
        await user.save();
        res.status(200).json(user);
    } catch(err) {
        res.status(400).send(err);
    }
});

app.use("/api", router);
app.listen(3000);