const mongoose = require("mongoose");
const validator =  require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");



const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Required field"],
        maxlength:[30,"Max length exceeded"],
        minlength:[4,"Min length not met"]
    },
    email:{
        type:String,
        required:[true,"Email field cannot be empty"],
        unique:true,
        validate:[validator.isEmail,"Please enter a valid email"]

    },
password:{
    type:String,
    required:[true,"Password field cannot be empty"],
    minlength:[8,"Password cannot be less than 8 characters"],
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
 createdAt:{
     type:Date,
     default:Date.now,
 },
 resetPasswordToken:String,
 resetPasswordExpire:Date,
    
    }
)

userSchema.pre("save",async function(next)
{
    if(!this.isModified("password"))
    {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)


});

//JWT TOKEN
userSchema.methods.getJWTToken = function ()
 {
    return jwt.sign({id:this._id}, process.env.JWT_KEY, {
        expiresIn:process.env.JWT_EXPIRE
    });
}

//compare password
userSchema.methods.comparePassword = async function(enteredPassword) 
{
    return await bcrypt.compare(enteredPassword, this.password);
}


//password reset
userSchema.methods.getResetPasswordToken = function()
{
const resetToken = crypto.randomBytes(20).toString("hex");

//hashing and adding to user schema

this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

return resetToken;

};

module.exports = mongoose.model("User", userSchema);

