const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto  = require("crypto");
const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"Please Enter your Name"],
        maxlength:[30,"Name cannot exceed 30 characters"],
        minlength:[4,"Name sould have more than 4 characters"],
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:true,
        validate:[validator.isEmail,"Please enter valid Email"],
    },
    password:{
        type:String,
        required:[true,"Please Enter your Password"],
        minlength:[8,"Password should be atleast 8 characters"],
        select:false,
    },
    avatar:{
            public_id:{
                type:String,
                required:true
            },
            url:{
                type:String,
                required:true
            },
    },
    role:{
        type:String,
        default:"user",
    },

    resetPassowrdToken:String,
    resetPassowrdExpire:Date,
});

// password encryption
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10);
});

//JWT token - generate token and store it in cookie, so server whould know that this is the user and access
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};


//compare password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}

//reset password token generation
userSchema.methods.getResetPasswordToken = function(){

    //generate token, generate buffer value and convert to hex
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding to user schema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //sets expiration time of the password reset step
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}


module.exports = mongoose.model("User",userSchema);
