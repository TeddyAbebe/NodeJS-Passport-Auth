const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const isAuthenticated = require("./auth");

router.get("/", (req, res) => {
  res.render("home", { body: "welcome" });
});

// Auth Register
router.get("/register", (req, res) => {
  res.render("home", { body: "register" });
});

router.post("/register", async (req, res) => {
  const { name, email, password, password2 } = req.body;

  if (password !== password2) {
    // Passwords do not match
    res.render("register", { message: "Passwords do not match" });
  } else {
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        // User already exists
        res.render("register", { message: "Email is already registered" });
      } else {
        // Create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
          name: name,
          email: email,
          password: hashedPassword,
        });

        await newUser.save();

        // Redirect to login page after successful registration
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
  res.render("home", { body: "login" });
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      // User not found
      return res.redirect("/login");
    }

    // Check if the password is correct
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incorrect password
      return res.redirect("/login");
    }

    // Log in the user manually
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      return res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Profile
router.get("/profile", isAuthenticated, (req, res) => {
  res.render("home", { user: req.user, body: "profile" });
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
