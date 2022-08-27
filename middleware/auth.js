const jwt = require('jsonwebtoken')
const SECRET_CODE = process.env.SECRET_CODE

const auth = (req, res, next) => {
    const token = req.header('x-auth-token')
    if (!token) return res.status(401).send('No token provided')

    try {
        const decoded = jwt.verify(token, SECRET_CODE)
        req.user = decoded
        next()
    } catch (ex) {
        res.status(400).send('Invalid token')
    }
}

module.exports = auth