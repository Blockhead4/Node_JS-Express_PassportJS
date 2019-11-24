const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");

const app = express();
app.use(helmet());

const session = require("express-session");
const FileStore = require("session-file-store")(session);

const myMiddleWare = (request, response, next) => {
  fs.readdir("./data", (err, filelist) => {
    if (err) throw err;
    request.list = filelist;
    next();
  });
};

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    HttpOnly: true,
    secure: true,
    secret: "asdfasef21212@#@!#",
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  })
);

const authData = {
  email: "asdf@asdf.com",
  password: "1234",
  nickname: "egoing"
};

const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "pwd"
    },
    function(username, password, done) {
      console.log("LocalStrategy: ", username, password);

      if (username === authData.email) {
        console.log(1);
        if (password === authData.password) {
          console.log(2);
          return done(null, authData);
        } else {
          console.log(3);
          return done(null, false, {
            message: "Incorrect password"
          });
        }
      } else {
        console.log(4);
        return done(null, false, {
          message: "Incorrect username"
        });
      }
    }
  )
);

app.post(
  "/auth/login_process",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login"
  })
);

app.get("*", myMiddleWare);

const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth");

app.use("/", indexRouter);
app.use("/topic", topicRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry cant find that!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => console.log("Example app listening on port 3000!"));
