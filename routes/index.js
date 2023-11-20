require("dotenv").config();
const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  res.render("home", { body: "welcome" });
});

// Auth Register
router.get("/register", (req, res) => {
  const errorMessage = req.query.error;
  res.render("home", { body: "register", error: errorMessage });
});

router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;

  if (password !== password2) {
    // Passwords do not match
    return res.redirect("/register?error=Passwords do not match");
  } else {
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        // User already exists
        return res.redirect("/register?error=User already registered");
      } else {
        // Create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          name: name,
          email: email,
          password: hashedPassword,
        });

        await newUser.save();

        res.redirect("/login");
      }
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  }
});

// Auth Login
router.get("/login", (req, res) => {
  const errorMessage = req.query.error;
  res.render("home", { body: "login", error: errorMessage });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      // User not found
      return res.redirect("/login?error=User not found");
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incorrect password
      return res.redirect("/login?error=Incorrect password");
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Log the token
    console.log("Generated Token:", token);

    // Send the token to the client
    res.cookie("token", token, { httpOnly: false });

    return res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Profile
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.render("home", { user: req.user, body: "profile" });
  }
);

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
``;

module.exports = router;
