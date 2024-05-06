const logRequest = (req, res, next) => {
    console.log(req.method);
    next();
};

module.exports = logRequest;
