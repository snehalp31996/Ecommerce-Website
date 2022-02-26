const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail.js");
const res = require("express/lib/response");
const crypto = require("crypto");
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

    const isPasswordMatched = await user.comparePassword(password);

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

});

//Reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next) => {
    
    //creating token hash
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    // find token and expire time greater than current time.
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt:  Date.now() },
    });

    // if user not found
    if(!user){
        return next(new ErrorHandler("Reset Password token is invalid or has been expired",400));
    }

    // if password not match
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400));
    }
    // user.email = req.body.email;
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    //login after password change
    sendToken(user,200,res);
});


//Get User Details

exports.getUserDetails = catchAsyncErrors(async(req,res,next) =>{
    const user = await User.findById(req.user.id);


    res.status(200).json({
        success:true,
        user,
    });
    
});


//Update User Password

exports.updatePassword = catchAsyncErrors(async(req,res,next) =>{
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match",400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200, res);
    
});


//Update User Profile

exports.updateProfile = catchAsyncErrors(async(req,res,next) =>{
    
    const newUserData = {
        name: req.body.name,
        email: req.body.email,

    };

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });


    res.status(200).json({
        success:true,
    });
    
});


//Get all users (Admin)
exports.getAllUser = catchAsyncErrors(async(req,res,next) =>{

    const users = await User.find();

    res.status(200).json({
        succes:true,
        users,
    });
});

//Get single user details (Admin)
exports.getSingleUser = catchAsyncErrors(async(req,res,next) =>{

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exists with ID: ${req.params.id}`));
    }
    res.status(200).json({
        succes:true,
        user,
    });
});

//Update User Role -- Admin

exports.updateUserRole = catchAsyncErrors(async(req,res,next) =>{
    
    const newUserRole = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,

    };

    const user = await User.findByIdAndUpdate(req.params.id,newUserRole,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });


    res.status(200).json({
        success:true,
    });
    
});


//Delete User - Admin

exports.deleteUser = catchAsyncErrors(async(req,res,next) =>{
    
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User Not Found with id: ${req.params.id}`,400));
    }

    await user.remove();

    res.status(200).json({
        success:true,
        message:"User deleted Succesfully",
    });
    
});