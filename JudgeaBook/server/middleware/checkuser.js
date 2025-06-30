const jwt = require('jsonwebtoken');
const secret = process.env.Some_SECRET; // Replace with your actual secret

const check = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, secret);
            res.locals.user = decoded; // You can access decoded.username, decoded.id, etc.
        } catch (err) {
            console.error("Invalid token:", err.message);
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
};

module.exports = check;