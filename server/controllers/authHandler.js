const AppError = require('./../utils/AppError');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const sendEmail = require('./../utils/sendEmail');
const { promisify } = require('util');

const sendEmailForVerification = async function (email, res) {


    var val = Math.floor(1000 + Math.random() * 9000);
    const user = await User.findOne({ email: email });
    if (!user) {

        return res.status(404).json({
            status: 'fail',
            message: 'Please provide valid email'
        });
    }

    user.emailCode = val;
    await user.save({ validateBeforeSave: false });
    const message = `your varification code is ${val}`;
    const data = {
        to: email,
        subject: 'UpTurn Email verification ',
        message
    };
    await sendEmail(data);

    res.status(201).json({
        status: 'success',
        message: 'email has been sent'
    });
};



const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
};


const sendTokenCookee = async (user, statusCode, res) => {

    const token = signToken(user._id);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === 'production')
        cookieOption.secure = true;
    await res.cookie('jwt', token, cookieOption);

    user.password = undefined;

    return res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });

};




exports.signUp = async (req, res, next) => {
    try {
        let newUser = await User.create(req.body);
        await sendEmailForVerification(newUser.email, res);

    } catch (err) {
        next(new AppError('some thing Wrong', 400));

    }
};


exports.login = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new AppError('Please write email and password', 404));
        }

        const user = await User.findOne({ email: email }).select('+password');


        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new AppError('Please write valid email or password', 404));
        }
        if (user.active === false) {
            return next(new AppError('Your acount is not active', 404));
        }
        sendTokenCookee(user, 200, res);

    } catch (err) {
        next(new AppError('Something wrong wrong', 400));
    }

};




exports.emailVerificationCode = async (req, res, next) => {

    try {
        const { email } = req.body;
        if (!email) {
            next(new AppError('Provide valid email', 404));
        }
        sendEmailForVerification(email, res);

    } catch (err) {
        next(new AppError('Something wrong wrong', 400));
    }


};


exports.verifyEmail = async (req, res, next) => {

    try {
        const { code, email } = req.body;
        if (!email) {
            return next(new AppError('Provide valid email', 404));
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return next(new AppError('Please provide valid email', 404));
        }
        const userCode = user.emailCode;
        if (!userCode) {
            sendEmailForVerification(email, res);
        }
        if (userCode === code) {
            user.emailCode = undefined;
            user.active = true;
            user.emailVarify = true;
            user.save({ validateBeforeSave: false });

            return res.status(404).json({
                status: 'success',
                message: "Plese log in again"
            });
        }
        else {

            return next(new AppError('your code is in valid', 404));
        }
    } catch (err) {
        next(new AppError('Something went wrong', 404));
    }

};


exports.protect = async (req, res, next) => {
    // let token;
    // if (
    //     req.headers.authorization &&
    //     req.headers.authorization.startsWith('Bearer')
    // ) {
    //     token = req.headers.authorization.split(' ')[1];
    // }




    try {


        const token = await req.cookies.jwt;

        if (!token) {
            return next(
                new AppError('You are not logged in! Please log in to get access.', 401)
            );
        }
        console.log(token);
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        // const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        console.log(decode);
        const currentUser = await User.findById(decode.id);
        if (!currentUser) {
            return next(
                new AppError(
                    'The user belonging to this token does no longer exist.',
                    401
                )
            );
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changePasswordAfter(decode.iat)) {
            return next(
                new AppError('User recently changed password! Please log in again.', 401)
            );
        }

        // req.user = {
        //     id: decode.id,
        //     firstname: decode.firstname,
        //   };
        req.user = {
            id: currentUser._id,
            email: currentUser.email,
            name: currentUser.name
        };
        console.log('req.user', req.user);

        next();


    } catch (err) {

        return next(
            new AppError(err, 401)
        );

    }
};



exports.forgetPassword = async (req, res, next) => {

};


exports.changePassword = async (req, res, next) => { };

// exports.resetPassword = async (req, res, next) => { };