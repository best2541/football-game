const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1];
        req.token = bearerToken
        req.user = jwt.verify(bearerToken, process.env.SECRET)
        next()
    } else {
        return res.sendStatus(401)
    }
}
module.exports = verifyToken