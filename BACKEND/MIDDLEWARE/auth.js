const ErrorHandler = require("../UTILS/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next) =>
{
    const {token} = req.cookies;
    if(!token) 
    {
        return next(new ErrorHandler("Please Login to access this page", 401));
    
    }
    
    const decodedData = jwt.verify(token, process.env.JWT_KEY);
    req.user = await User.findById(decodedData.id);
   
    next();

})

exports.authorizedRoles = (...role) =>
 {
    return (req,res,next) => 
    {
        if(!role.includes(req.user.role))
        {
            return next(new ErrorHandler(`The user is not authorized is ${req.user.role}`, 403));

        }
        next();
    }
    
}