const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const User = require("../models/User");

//register

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashpswd = await bcrypt.hash(password, 15);
        const user = await User.create({ name, email, password: hashpswd });
        res.json({ message: "register successfully" });
    } catch (err) {
        console.error(err);
    }
});
//login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.json({ error: "invalid user" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ error: "invalid user" });
        const token = jwt.sign({ userId: user._id }, process.env.jwt_secret, { expiresIn: "1d" });
        res.json({token});
    } catch (err) {
        console.error(err);
    }
});
module.exports = router 