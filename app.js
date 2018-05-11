var express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose"),
  User = require("./models/user");

//init setup
mongoose.connect("mongodb://localhost/auth_demo");

var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: "secret word",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//-----------------------

//routes
app.get("/", function(req, res) {
  res.render("home");
});

app.get("/auth_view", isLoggedIn, function(req, res) {
  res.render("auth_view");
});

//authentification
//reg
app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function(err, user) {
      if (err) {
        console.log("err");
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/auth_view");
        });
      }
    }
  );
});

//login
app.get("/login", function(req, res) {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/auth_view",
    failureRedirect: "/login"
  }),
  function(req, res) {}
);

//logout
app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
//---------------------------
app.listen(3000, function() {
  console.log("server started");
});
