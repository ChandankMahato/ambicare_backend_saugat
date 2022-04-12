exports.userMiddleware = (req, res, next) => {
    if (req.auth.role === 'user') {
        next();
    } else {
        res.status(401).json({message: "Access denied"})
    }
}

exports.driverMiddleware = (req, res, next) => {
    if (req.auth.role === 'driver') {
        next();
    } else {
        res.status(401).json({message: "Access denied"})
    }
}

exports.serviceMiddleware = (req, res, next) => {
    if (req.auth.role === 'service') {
        next();
    } else {
        res.status(401).json({message: "Access denied"})
    }
}