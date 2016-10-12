var Firebase = require("firebase");
var crypto = require("crypto");

function hashPassword(password){
  return crypto.createHash("sha512").update(password).digest("hex");
}

var firebase = new Firebase("https://torrid-torch-9503.firebaseio.com/");
var users = firebase.child("users");

var router = require("express").Router();

router.use(require("body-parser").json());
router.use(require("cookie-parser")());
router.use(require("express-session")({
  resave: false,
  saveUnintialized: true,
  secret: "heyfuckoffwhatsup"
}));

router.post('/api/signup', function(req, res){
  var username = req.body.username,
      password = req.body.password;

  if (!username || !password)
    return res.json({signedIn: false, message: "no username or password!"});

  users.child(username).once("value", function(snapshot){
    if (snapshot.exists())
      return res.json({signedIn: false, message: "Username already in use!"});

    var userObj = {
      username: username,
      hashPassword: hashPassword
    };
    users.child(username).set(userObj);
    req.session.user = userObj;
    res.json({
      signedIn: true,
      user: userObj
    });
  });
});


router.post('/api/signin', function(req, res){
  var username = req.body.username,
      password = req.body.password;

  if (!username || !password)
    return res.json({signedIn: false, message: "no username or password!"});

  if (users.child(username).once("value", function(snapshot){
    if (snapshot.exists() || snapshot.child("hashPassword") !==  hashPassword(password))
      return res.json({signedIn: false, message: "wrong username & password!"});

    var user = snapshot.exportVal();

    req.session.user = user;
    res.json({
      signedIn: true,
      user: user
    })
  })
});


router.post("/api/signout", function(req, res){
  delete req.session.user;
  res.json({
    signedIn: false,
    message: "You have been signed out!"
  })
});


module.exports = router