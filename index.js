const express = require("express");
const mongoose = require("mongoose");
const userModel = require("./Model/userModel");
const BMIModel = require("./Model/bmiModel")
const PORT = 8091;
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => res.send("Welcome to Home page"));

app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new userModel({ name, email, password });
        await user.save();
        return res.status(201).send("User Signup Successully");
    }
    catch (e) {
        res.status(404).send({ message: "User already Exist" })
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, password });
    if (user) {
        return res
            .status(200)
            .send(user);

    }
    else {
        return res.status(401).send("Invalid Userid or Password")
    }
});

app.get("/getProfile", async (req, res) => {
    const { password, email } = req.body
    const user = await userModel.findOne({ email })
    res.send({ email })
})



app.post("/calculateBMI", async (req, res) => {
    const { height, weight, _id } = req.body;
    const height_in_metre = Number(height) * 0.3048
    const BMI = Number(weight) / (height_in_metre) ** 2
    const new_bmi = new BMIModel({
        BMI,
        height: height_in_metre,
        weight,
        _id
    })
    await new_bmi.save()
    res.send({ BMI })
})

app.get("/getCalculation", async (req, res) => {
    const { _id } = req.body;
    const all_bmi = await BMIModel.find({ _id })
    res.send({ history: all_bmi })
})

mongoose.connect("mongodb+srv://banuSri:chinayi24@cluster0.e8muobu.mongodb.net/mock15?retryWrites=true&w=majority").then(() => {
    mongoose.set('strictQuery', false);
    app.listen(PORT, (req, res) => {
        console.log("Port started at http://localhost:8091 ");
    });
})
