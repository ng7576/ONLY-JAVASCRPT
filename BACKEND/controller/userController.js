const ErrorHandler = require("../UTILS/errorhandler");
const catchAsyncErrors = require("../MIDDLEWARE/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../UTILS/jwtmanager");
const sendEmail = require("../UTILS/sendEmail");
const crypto = require("crypto");
const { result } = require("lodash");
const cloudinary = require("cloudinary").v2;

exports.registerUser = catchAsyncErrors( async (req, res, next) => {
    
    console.log(req.body.avatar);
    const myCLoud = await cloudinary.uploader.upload(req.body.avatar,
        {
        folder:"avatars",
        width:150,
        crop:"scale",
    }
    );
    console.log(myCLoud)

    const {name, email, password} = req.body;
    // console.log(name)
    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id:myCLoud.public_id,
            url:myCLoud.secure_url,
        },
    });
    console.log({...user})
    sendToken(user, 201, res);

});

//LOGIN USER
exports.loginUser = catchAsyncErrors( async (req, res, next) => 
{
    const {email,password} = req.body;

    if(!email || !password) {
        return next(new ErrorHandler("Either email or password is missing", 400))
    }
    
    const user = await User.findOne({email}).select("+password");
    if(!user) 
    {
        return next(new ErrorHandler("Invalid email or password"));

    }
    //how to fuckup login 101 forget to type in await for isPasswordMatched every one is a user yay!!

    const isPasswordMatched = await user.comparePassword(password);


    if(!isPasswordMatched) 
    {
        return next(new ErrorHandler("Invalid email or password", 401));

    }
 
    sendToken(user,200, res);
});

//USER logout

exports.logout = catchAsyncErrors(async(req,res) => 
{
    res.cookie("token", null, {
        expires : new Date(Date.now()),
        httpOnly:true,
    });

    res.status(200).json({
        success:true,
        message:"Logged out successfuly"
    })

})

//Forgot password


exports.forgotPassword = catchAsyncErrors( async(req, res, next) =>
{
    const user = await User.findOne({email:req.body.email});
    if(!user)
    {
        return next( new ErrorHandler("User not found", 404));
    }

    // get reset password token
    const resetToken =  user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset link is : \n\n ${resetPasswordUrl} \n\n if you have not requested this email ignore this`;

    try 
    {
        await sendEmail ({
            email:user.email,
            subject:`Website password recovery`,
            message,

        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email}`
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message, 500));

    }
})

//reset password

exports.resetPassword = catchAsyncErrors( async (req, res, next) => 
{
    //creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt:Date.now() },
    });
    if(!user)
    {
        return next( new ErrorHandler("Invalid Token or expired Token", 400));
    }
    if(req.body.password !== req.body.confirmPassword)
    {
        return next( new ErrorHandler("Passwords dont match", 400));

    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); 
    sendToken(user, 200, res);


});

exports.getUserDetails = catchAsyncErrors(async(req,res,next) => 
{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
})
//update password

exports.updatePassword = catchAsyncErrors(async(req,res,next) => 
{
    const user = await User.findById(req.user.id).select("+password");
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if(!isMatched) 
    {
        return next(new ErrorHandler("Old password is not correct"), 400);
    }

    if(req.body.newPassword !== req.body.confirmPassword)
    {
        return next( new ErrorHandler("The new passwords dont match"),400);
    }

    user.password = req.body.newPassword;
   await  user.save()
   sendToken(user,200, res);
})

//update profile
exports.updateProfile = catchAsyncErrors(async (req, res , next)=> 
{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    };

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);
        const imageId = user.avatar.public_id;
        await cloudinary.uploader.destroy(imageId);

        const myCLoud = await cloudinary.uploader.upload(req.body.avatar, {
            folder:"avatars",
            width: 150,
            crop:"scale"
        }) ;
    
        newUserData.avatar = {
            public_id:myCLoud.public_id,
            url:myCLoud.secure_url,
        }
    

    }
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        sucess:true,
    });
});


   //Get all user
exports.getAllUser = catchAsyncErrors(async (req,res,next) => 
   {
       const users = await User.find();

       res.status(200).json({
           success:true,
           users,
       });
   });

// get single user 
exports.getSingleUser = catchAsyncErrors(async (req,res,next) => 
{
    const user = await User.findById(req.params.id);

    if(!user) 
    {
        return next (new ErrorHandler(`User id ${req.params.id} does not exists `,404 ))
    }

    res.status(200).json({
        success:true,
        user,
    });
});
 

//Update user role
exports.updateUserRole = catchAsyncErrors(async (req,res , next)=> 
{
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.boday.role,
    }
  //add if user is not found
    const user = await User.findById(req.params.id);
    if(!user) 
    {
        return next(new ErrorHandler("User deos not exist ", 404));
    }
    await user.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators:true,
        useFindAndModify:false,
    })

    res.status(200).json({
        sucess:true,
    });
});

//Delete user
exports.deleteUser= catchAsyncErrors(async (req,res , next)=> 
{
    const user= await User.findById(req.params.id);
    if(!user) 
    {
        return next(new ErrorHandler("User deos not exist ", 404));
    }
    await user.remove();

    res.status(200).json({
        sucess:true,
        message:"User has been deleted"
    });
});