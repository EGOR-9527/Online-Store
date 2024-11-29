

module.exports = function (req, res, next) {
    try {
        console.log("session: " + req.session.refreshToken)
        next();

    } catch (error) {
        res.status(401).send({ message: error.message })
    }
};