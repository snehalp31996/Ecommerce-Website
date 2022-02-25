const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
// const { userInfo } = require("os");

exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next) =>{
    
    const {token} = req.cookies;
    //if not token
    if(!token){
        return next(new ErrorHandler("Please login to access this resource",401));
    }

        const decodedData = jwt.verify(token,process.env.JWT_SECRET);
        //save the decoded id in the user
        req.user = await User.findById(decodedData.id);
        next();
    // console.log(token);
});

exports.authorizeRoles = (...roles) =>{
    return (req,res,next) =>{
        //will check if the user(admin etc) is not present in the roles array
        if(!roles.includes(req.user.role))
        {
            return next(new ErrorHandler(
                `Role: ${req.user.role} is not allowed to access this resource`,
                403));
        }

        next();
    };
};