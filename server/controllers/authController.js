import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
export  const register = async (req,res) => {
  const {name, email, password} = req.body;

  if(!name || !email || !password){
    return res.json({
      sucess: false,
      message: 'Missing details'
    })
  }

  try {

    const existingUser = await userModel.findOne({email});
    if(existingUser){
      return res.json({
        sucess: false,
        message: 'User already exists'
      });
    }
    const hashedPasssword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name, 
      email,
      password: hashedPasssword
    });
    await user.save();
    
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});

    res.cookie('token', token,
       {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Send email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to Airbnb',
        text: ` Welcome to Airbnb website. Your  account has been created with email id:${email}.`,
      }

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'User registered successfully'
      })

  } catch (error) {
    res.json({
      sucess: false,
      message: error.message
    })
  }
}

export const login = async (req, res) => {
  const {email, password} = req.body;
  if(!email || !password){
    return res.json({
      success: false,
      message: 'Email and password are required'
    })
  }

  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({
        success: false,
        message: 'User email is invalid'
      })
    }

    const isMatch =  await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.json({
        success: false,
        message: 'Password is invalid'
      })
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
    res.cookie('token', token,
      {
       httpOnly: true, 
       secure: process.env.NODE_ENV === 'production',
       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
       maxAge: 7 * 24 * 60 * 60 * 1000
     })

     res.json({
      success: true,
      message: 'User logged in successfully'
     })
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie('token',{
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({
      success: true,
      message: 'User logged out successfully'
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

//Send verification OTP to user's email
export const sendVerifyOtp = async (req, res) => {
  try {
    const {userId} = req.body;
    const user = await userModel.findById(userId);
    if(user.isAccountVerified){
      return res.json({
        success: false,
        message: 'User account is already verified'
      })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpEpireAt = Date.now() +  24 * 60 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP  is ${otp}. Verify your account using this OTP , It will be expired in 24 hours.`,
    }

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Verification OTP sent Email'
    })

  } catch (error) {
    res.json({
      success: false,
      message: error.message
    })
  }
}

export const verifyEmail = async (req, res) => {
  const {userId, otp} = req.body;
  if(!userId || !otp) {
    return  res.json({
      success: false,
      message: 'User id and OTP are required'
    })
  }
  try {
    const user = await userModel.findById(userId);
    if(!user){
      return res.json({
        success: false,
        message: 'User not found'
      })
    }

    if(user.verifyOtp === '' || user.verifyOtp!== otp){
      return res.json({
        success: false,
        message: 'Invalid OTP'
      })
    }

    if(user.verifyOtpEpireAt < Date.now()){
      return res.json({
        success: false,
        message: 'OTP expired'
      })
    }

    user.isAccountVerified = true;
    user.verifyOtp = '';
    user.verifyOtpEpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: 'User account verified successfully'
    });


  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

//Check if user is authenticated
export const isAuthenticated = async(req, res) => {
  try {
    return res.json({
      success: true,
      message: 'User is authenticated'
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}

//Send reset password OTP
export const sendResetOTP = async(req, res) => {
  const {email} = req.body;
  if(!email){
    return res.json({
      success: false,
      message: 'Email is required'
    })
  }
  try {
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() +  15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Password Reset  OTP',
      text: `Your OTP for resetting your password is ${otp}.Use this OTP to proceed with resetting your password.`,
    }
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'Password reset OTP sent to your email'
    })

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}


//Reset user password  
export const resetPassword = async (req, res) => {
  const {email, otp, newPassword} = req.body;
  if(!email || !otp || !newPassword){
    return res.json({
      success: false,
      message: 'Email , OTP, and new Password are required'
    })  
  }

  try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.json({
        success: false,
        message: 'User not found'
      });
    }

    if(user.resetOtp === '' || user.resetOtp !== otp){
      return res.json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if(user.resetOtpExpireAt < Date.now()){
      return res.json({
        success: false,
        message: 'OTP expired'
      });
    }

    const hashedPasssword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPasssword;
    user.resetOtp = '';
    user.resetOtpExpireAt = 0;

    await user.save();
    return res.json({
      success: true,
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message
    })
  }
}