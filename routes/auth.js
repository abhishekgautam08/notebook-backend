const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT__SECRET = "AbhshekisGoodB@oy";

// Route 1:  Creating a User Using: POST "/api/auth/createuser" doesn't require auth
router.post(
  "/createuser",
  [
    body("name", "Enter valid Name").isLength({ min: 3 }),
    body("email", "Enter valid Email").isEmail(),
    body("password", "Password must be atleast 5 Character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    // if there are error , return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    // check wheater user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });

      if (user) {
        return res.status(400).json({
          success: false,
          error: "sorry a user with this email already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      //Create a new User
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };

      const userForFE = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      const authtoken = jwt.sign(data, JWT__SECRET);
      res.json({ success: true, authtoken, user: userForFE });
      // catch error
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error occured");
    }
  }
);

// Route 2: Authenticate a Using: POST "/api/auth/login" doesn't require auth
router.post(
  "/login",
  [
    body("email", "Enter valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // if there are error , return bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Please try to login with correct password",
        });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct password" });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(payload, JWT__SECRET);
      const userForFE = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      res.json({ success: true, authtoken, user: userForFE });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error ");
    }
  }
);

// Route 3: Get logged in User details a Using: POST "/api/auth/getuser" doesn't require auth
router.get("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error ");
  }
});
module.exports = router;
