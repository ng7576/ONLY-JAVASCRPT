const ErrorHandler = require("../UTILS/errorhandler");

module.exports = (err, req, res, next) => 
{
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    //Database ID Error
    if(err.name === "CastError") {
        const message = `Unable to resolve request. Invalid:${err.path}`;
        err = new ErrorHandler(message, 400);
    };
    //Duplicate key error
    if(err.code === 11000) 
{
    const message = `Duplicated ${Object.keys(err.keyValue)}`
    err= new ErrorHandler(message, 400);
};

//Database ID Error
if(err.name === "JsonWebTokenError") 
{
    const message = `JWT is invalid`;
    err = new ErrorHandler(message, 400);
};

    res.status(err.statusCode).json({
        success:false,
        error:err,
        message:err.message
    });
}



