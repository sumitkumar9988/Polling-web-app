const Survey = require('./../models/survayModel');
const User = require('./../models/userModel');
const AppError = require('./../utils/AppError');

exports.allPolls = async (req, res, next) => {

    try {
        const polls = await Survey.find().populate('questionBy', ['name']);
        return res.status(200).json({
            status: 'Success',
            data: {
                Survey: polls
            }
        });
    } catch (err) {
        return next(new AppError(
            'Something went wrong',
            400
        ));
    }
};
exports.getPoll = async (req, res, next) => {
    try {

        const poll = Survey.findOneById(req.params.pollsId).populate('questionBy');

        return res.status(200).json({
            status: 'Success',
            data: {
                Survey: poll
            }
        });
    } catch (err) {
        return next(new AppError(
            err,
            400
        ));
    }
};



exports.createPolls = async (req, res, next) => {
    try {

        const { question, options } = req.body;

        const allOption = options.map((option) => {
            return {
                option: option,
                votes: 0
            };
        });


        if (!question || !options) {
            return next(new AppError(
                'Please Provide valid question with at least 2 options',
                400
            ));
        }

        const currentUser = await User.findById(req.user.id);

        const poll = await Survey.create({
            question: question,
            options: allOption,
            questionBy: req.user.id
        });


        currentUser.Surveys.push(poll._id);
        await currentUser.save({ validateBeforeSave: false });

        return res.status(200).json({
            status: 'Success',
            data: {
                Survey: poll
            }
        });
    } catch (err) {
        return next(new AppError(
            err,
            400
        ));
    }
};

exports.getUserPolls = async (req, res, next) => {

    try {

        const userPolls = await User.findById(req.user.id).populate('Surveys');


        return res.status(200).json({
            status: 'Success',
            data: {
                Survey: userPolls.Surveys
            }
        });
    } catch (err) {
        return next(new AppError(
            'Something went wrong',
            400
        ));
    }
};

exports.vote = async (req, res, next) => {

    try {
        const answer = req.body.answer;
        console.log(answer);
        if (!answer) {
            return next(new AppError(
                "You must select option",
                404
            ));
        }


        const poll = await Survey.findById(req.params.id);
        const user = await User.findById(req.user.id);
        if (poll.votedBy.includes(req.user.id)) {
            return next(new AppError(
                "You have already voted",
                406
            ));

        }
        poll.votedBy.push(req.user.id);
        const currentVote = poll.totalVotes;
        poll.totalVotes = currentVote + 1;
        console.log(poll.totalVotes);
        const vote = poll.options.map(
            option =>
                option.option === answer
                    ? {
                        option: option.option,
                        _id: option._id,
                        votes: option.votes + 1,
                    }
                    : option,
        );

        await poll.save();

        console.log(vote);
        return res.status(200).json({
            status: 'Success',
            data: {
                Survey: poll
            }
        });
    } catch (err) {
        return next(new AppError(
            err,
            400
        ));
    }
};

exports.deletePoll = async (req, res, next) => {

    try {

        const poll = await Survey.findById(req.params.id).populate('questionBy');
        const quesAuther = poll.questionBy._id;
        console.log("ques by", quesAuther);

        const reqBy = req.user.id;
        console.log("req By", reqBy);
        //check user of poll and match with currentUser
        if (quesAuther.toString() === reqBy.toString()) {
            await Survey.findByIdAndDelete(req.params.id);
            const user = await User.findById(req.user.id).populate('Surveys');
            user.Surveys.remove(req.params.id);
            return res.status(200).json({
                status: 'Success',
                "message": "Survey has been deleted successfully!"
            });

        }

        return next(new AppError(
            'You are not authorized to delete Survey',
            400
        ));

    } catch (err) {
        return next(new AppError(
            'Something went wrong',
            400
        ));
    }
};


