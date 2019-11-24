const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const helmet = require("helmet");

const app = express();
app.use(helmet());

const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("connect-flash");
const db = require("./lib/db");

const myMiddleWare = (request, response, next) => {
  request.list = db.get("topics").value();
  next();
};

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    // HttpOnly: true,
    // secure: false, // true로 설정하면 SereializeUser로 세션에 passport.user 객체가 생성되지 않음
    secret: "asdfasef21212@#@!#",
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
  })
);
app.use(flash());

const passport = require("./lib/passport")(app);

app.get("*", myMiddleWare);

const indexRouter = require("./routes/index");
const topicRouter = require("./routes/topic");
const authRouter = require("./routes/auth")(passport);

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
