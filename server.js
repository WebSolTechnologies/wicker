var express = require('express');

express()
    .set("view engine", "ejs")
    .use(express.static('./public'))
    .use(require("./account"))
    .get("*", function (req, res){
	     res.render('index', {
		      user: JSON.stringify(req.session.user || null)
	     });
    })
    .listen(3000);
