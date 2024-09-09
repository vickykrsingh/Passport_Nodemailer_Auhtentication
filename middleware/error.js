const errorHandler = (err, req, res, next) => {
    console.error(err.message);
    res.status(err.statusCode || 500).json({
        status: 'error',
        statusCode: err.statusCode || 500,
        message: err.message,
    });
};

module.exports = errorHandler;
