const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers["authorization"]
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(" ")
        const bearerToken = bearer[1].slice(1, -1);
        req.token = bearerToken
        try {
            req.user = jwt.verify(bearerToken, process.env.SECRET)
            next()
        } catch (err) {
            return res.sendStatus(401)
        }
    } else {
        return res.sendStatus(401)
    }
}
module.exports = verifyToken