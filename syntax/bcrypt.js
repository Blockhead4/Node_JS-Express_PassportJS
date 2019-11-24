const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "1234";
const someOtherPlaintextPassword = "1111";

bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  console.log(hash);
});
