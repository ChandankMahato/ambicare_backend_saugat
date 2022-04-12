const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send("Access denied. No token provided.")

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.auth = decode;
        next();
    } catch (ex) {
        console.log("h");
        return res.status(400).send("Invalid token");
    }
}