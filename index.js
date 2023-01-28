const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

const connection = require("./config/db");
const { userModel } = require("./models/User.model");
const { authenticate } = require("./middleware/authenitication");

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: "*",
    })
);

app.get("/", (req, res) => {
    res.send("Welcome to Mock15");
});

app.post("/signup", async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;
    const userPresent = await userModel.findOne({ email });
    if (userPresent?.email) {
        res.send("Try again, already exist");
    } else {
        try {
            bcrypt.hash(password, 4, async function (err, hash) {
                const user = new userModel({ email, password: hash });
                await user.save();
                res.send("signup Successfull");
            });
        } catch (err) {
            console.log(err);
            res.send({ err: "Something went wrong" });
        }
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.find({ email });
        if (user.length > 0) {
            const new_password = user[0].password;
            bcrypt.compare(password, new_password, function (err, result) {
                if (result) {
                    const token = jwt.sign({ userID: user[0]._id }, "hash");
                    res.send({ msg: "Login Successfull", "token": token });
                } else {
                    res.send("Login Fail");
                }
            });
        } else {
            res.send("Login Fail");
        }
    } catch (err) {
        console.log(err);
        res.send({ err: "Something went wrong" });
    }
});

app.get('/logout', (req, res) => {
    res.send({ message: 'Logged out successfully' });
});

app.get("/about", (req, res) => {
    res.send("Welcome to About Page...");
});

app.use(authenticate)

const profile = {
    name: 'Banu',
    age: 24,
    height: 1.8,
    weight: 50
};

app.get('/getProfile', (req, res) => {
    res.json(profile);
});
app.get("/getProfile",  async (req, res) => {
  const {password, email} = req.body
  const user =await  userModel.findOne({email})
res.send({ email})
})


app.get("/getUser", async (req, res) => {
    try {
        const user = await userModel.findById(req.user.userID);
        if (!user)
            throw new Error("no such user exists");
        user.password = undefined;
        res.status(201).json({
            success: true,
            user
        })

    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: err.message,
        })
    }
})
const bmiHis = {};
app.get('/getBmi', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'hash');
    const bag = bmiHis[decoded.email] || [];
    res.send({ bag });
    res.sendFile(__dirname+"/index.html")
});

app.post('/bmi', (req, res) => {
    const { height, weight } = req.body;
    const heightMtr = height * 0.3048;
    const bmi = weight / (heightMtr * heightMtr);
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'hash');
    if (!bmiHis[decoded.email]) {
        bmiHis[decoded.email] = []
    }
    bmiHis[decoded.email].push(bmi);
    res.send({ bmi });
});

app.post("/getBmi",(req,res)=>{
    h=parseFloat(req.body.Height)
    // console.log(h)
    w=parseFloat(req.body.Weight)
    bmi=w/(h*h)
    bmi=bmi.toFixed()
    req_name=req.body.Name
    // res.send(`<h1>Hey ${req_name} your BMI : ${bmi} </h1>`)

})


app.listen(8081, async () => {
    try {
        await connection;
        console.log("Connected to DB");
    } catch (err) {
        console.log(err);
        console.log("Disconnected to DB");
    }
    console.log("Listening on Port 8081");
});
