const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');
const { findById } = require('./../models/userModel');
// const sendEmail = require('./../utils/sendEmail');

exports.getAllUsers = async (req, res, next) => {




    try {
        const allUsers = await User.find();

        return res.status(200).json({
            status: 'Success',
            data: {
                User: allUsers
            }
        });
    } catch (err) {
        return next(new AppError(
            'Something went wrong',
            400
        ));
    }
};
exports.getUser = async (req, res, next) => {

    try {
        const user = await User.findById(req.user.id).populate('Surveys');
        return res.status(200).json({
            status: "Success",
            User: {
                user
            }
        });

    } catch (err) {
        return next(new AppError(
            err,
            400
        ));
    }

};
exports.updateUser = async (req, res, next) => {
    try {

        if (req.body.password || req.body.passwordConfirm) {
            return next(
                new AppError(
                    'This route is not for password updates. Please use /updateMyPassword.',
                    400
                )
            );
        }
        const user = await User.findByIdAndUpdate(req.user.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(201).json({
            status: 'Success',
            User: {
                user
            }

        });
    } catch (err) {
        return next(new AppError(
            err,
            400
        ));
    }

};
exports.deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, {
            active: false
        });

        res.status(204).json({
            status: 'success',
            message: 'Your account is deactivate You can login When ever you want',

        });
    } catch (err) {
        return next(new AppError(
            'Something went wrong',
            400
        ));
    }

};


