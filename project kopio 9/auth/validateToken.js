/* 
User authorization. Checks if token sent from the frontend is valid or not. If it is not valid, then responses with 
401 unauthorized. If token is valid, sends verified user's email address as a response.

source: https://version.lab.fi/Erno.Vanhala/web-applications-week-7/-/blob/master/auth/validateToken.js */

const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const authHeader = req.headers["authorization"];
    //console.log(authHeader);
    if(authHeader) {
        token = authHeader.split(" ")[1];
    } else {
        token = null;
    }
    if(token == null) return res.sendStatus(401);
    console.log("Token found");
    jwt.verify(token, process.env.SECRET, (err, user) => {
        if(err) return res.sendStatus(401);
        req.user = user;
        next();
    });


    
};
