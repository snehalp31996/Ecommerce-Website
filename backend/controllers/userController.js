const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");

//Register a User
exports.registerUser = catchAsyncErrors(async(req,res,next) =>{
    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:"This is a sample id",
            url:"profilepicUrl"
        }
    });

    // const token = user.getJWTToken();

    // res.status(201).json({
    //     success:true,
    //     token,
    // });
    sendToken(user,201,res);
});



//Login User

exports.loginUser = catchAsyncErrors(async(req,res,next) =>{

    const{email,password} = req.body;

    //check if user has entered email and password
    if(!email || !password){
        return next(new ErrorHandler("Please Enter Email and Password",400))
    }

    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or passowrd",401));
    }

    const isPasswordMatched = user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or passowrd",401));
    }
    
    //Created a separate file to access below code
    // const token = user.getJWTToken();

    // res.status(200).json({
    //     success:true,
    //     token,
    // });

    sendToken(user,200,res);

});

// Logout User

exports.logout = catchAsyncErrors(async(req,res,next) =>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success:true,
        message:"Logged Out"
    });
});


//forgot password

exports.forgotPassword = catchAsyncErrors(async(req,res,next) =>{
    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("User not found",404));
    }

    //Get ResetPassword Token
    
    const resetToken = user.getResetPasswordToken();
    //set password when we get
    await user.save({validateBeforeSave:false});

    //link to reset password
    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
        )}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore.`;

    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,

        });
        //if email sent
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully!`,
        });
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave:false});


        return next(new ErrorHandler(error.message,500));
    }

})