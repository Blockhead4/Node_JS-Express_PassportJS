const db = require("./db");
const shortid = require("shortid");

module.exports = function(app) {
  const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    // console.log("serializeUser", user);
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    var user = db
      .get("users")
      .find({ id: id })
      .value();
    // console.log("deserializeUser", id, user);
    done(null, user);
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "pwd"
        // session: true
      },
      function(email, password, done) {
        // console.log("LocalStrategy", email, password);
        var user = db
          .get("users")
          .find({ email: email, password: password })
          .value();
        if (user) {
          return done(null, user, {
            message: "Welcome!"
          });
        } else {
          return done(null, false, {
            message: "Incorrect user information"
          });
        }
      }
    )
  );

  const googleCredentials = require("../config/google.json");
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0]
      },
      function(accessToken, refreshToken, profile, done) {
        console.log("GoogleStrategy", accessToken, refreshToken, profile);
        var email = profile.emails[0].value;
        var user = db
          .get("users")
          .find({ email: email })
          .value();
        if (user) {
          user.googleId = profile.id;
          db.get("users")
            .find({ id: user.id })
            .assign(user)
            .write();
        } else {
          user = {
            id: shortid.generate(),
            email: email,
            displayName: profile.displayName,
            googleId: profile.id
          };
          db.get("users")
            .push(user)
            .write();
        }
        done(null, user);
      }
    )
  );

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["https://www.googleapis.com/auth/plus.login", "email"]
    })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth/login" }),
    function(req, res) {
      res.redirect("/");
    }
  );

  return passport;
};
