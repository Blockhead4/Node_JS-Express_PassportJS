const express = require("express");
const router = express.Router();

const template = require("../lib/template.js");
const db = require("../lib/db");
const shortid = require("shortid");

module.exports = function(passport) {
  router.get("/login", (request, response) => {
    var fmsg = request.flash();
    var feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = "WEB - login";
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p>
          <input type="text" name="email" placeholder="email">
        </p>
        <p>
          <input type="password" name="pwd" placeholder="password">
        </p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
      `,
      ""
    );
    response.send(html);
  });

  router.post(
    "/login_process",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/login",
      failureFlash: true,
      successFlash: "Welcome!"
    })
  );

  router.get("/register", (request, response) => {
    var fmsg = request.flash();
    var feedback = "";
    if (fmsg.error) {
      feedback = fmsg.error[0];
    }
    var title = "WEB - login";
    var list = template.list(request.list);
    var html = template.HTML(
      title,
      list,
      `
      <div style="color:red;">${feedback}</div>
      <form action="/auth/register_process" method="post">
        <p>
          <input type="text" name="email" placeholder="email" value="asdf@asdf.com">
        </p>
        <p>
          <input type="password" name="pwd" placeholder="password" value="1234">
        </p>
        <p>
          <input type="password" name="pwd2" placeholder="confirm password" value="1234">
        </p>
        <p>
          <input type="text" name="displayName" placeholder="display name" value="egoing">
        </p>
        <p>
          <input type="submit" value="register">
        </p>
      </form>
      `,
      ""
    );
    response.send(html);
  });

  router.post("/register_process", (request, response) => {
    var post = request.body;
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;
    if (pwd !== pwd2) {
      request.flash("error", "Password must be same!");
      response.redirect("/auth/register");
    } else {
      var user = db
        .get("users")
        .find({ email: email })
        .value();
      if (user) {
        user.password = pwd;
        user.displayName = displayName;
        db.get("users")
          .find({ id: user.id })
          .assign(user)
          .write();
      } else {
        var user = {
          id: shortid.generate(),
          email: email,
          password: pwd,
          displayName: displayName
        };
        db.get("users")
          .push(user)
          .write();
      }

      request.login(user, function(err) {
        return response.redirect("/");
      });
    }
  });

  router.get("/logout", (request, response) => {
    request.logout();
    request.session.save(function() {
      response.redirect("/");
    });
  });

  return router;
};
