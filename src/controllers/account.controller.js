const Joi = require('joi');
const mongoose = require('mongoose');

const Responses = require('../utilities/responses.utilities');
const Account = require('../models/account.model');

// @desc POST Create Account
// @route POST - /account/create-account
// @access private
const createAccount = async (req, res) => {
    const { account_name, bank_account_number, initial_value } = req.body;
    const schema = Joi.object({
        account_name: Joi.string().trim().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required(),
        bank_account_number: Joi.string().min(10).max(20).pattern(/^[0-9]+$/).required(),
        initial_value: Joi.number().min(0).max(1000000000).precision(2),
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return Responses.sendErrorValidationResponse(res, error.details[0].message, 400);
    }

    try {
        var value = (initial_value === null) ? 0 : initial_value;

        const account = await Account.create({
            user_id: req.userId,
            account_name,
            bank_account_number,
            initial_value: value
        });

        return Responses.sendSuccessResponse(res, 'Success Submit Account', account, 201);
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            error.errorMessage = 'Duplicate Bank Account Number';
        }
        return Responses.sendErrorResponse(res, 'Error Submit Account', error, 400);
    }
}

// @desc GET List Detail Account
// @route POST - /account/list-detail-account
// @access private
const getAccountByUserId = async (req, res) => {
    try {
        const userAccount = await Account.find({
            user_id: req.userId,
        });

        if (!userAccount.length) {
            return Responses.sendSuccessResponse(res, 'Succes Get Account User', { "message": "Account User is Empty" }, 200);
        }

        return Responses.sendSuccessResponse(res, 'Succes Get Account User', userAccount, 200);
    } catch (error) {
        return Responses.sendErrorResponse(res, 'Error Get Account User', error, 400);
    }
}

// @desc GET Update Detail Account By Id
// @route POST - /account/update-detail-account/:id
// @access private
const updateAccountByUserId = async (req, res) => {
    const { id } = req.params;
    const { account_name, bank_account_number } = req.body;

    const schema = Joi.object({
        account_name: Joi.string().trim().min(2).max(100).pattern(/^[a-zA-Z\s]+$/).required(),
        bank_account_number: Joi.string().min(10).max(20).pattern(/^[0-9]+$/).required(),
    });

    // HANDLE VALIDATION BODY
    const { error } = schema.validate(req.body);
    if (error) {
        return Responses.sendErrorValidationResponse(res, error.details[0].message, 400);
    }

    try {
        const updatedData = {
            account_name: account_name,
            bank_account_number: bank_account_number
        };

        if (mongoose.Types.ObjectId.isValid(id)) {
            const userAccount = await Account.findOneAndUpdate(
                {
                    _id: id,
                    user_id: req.userId
                },
                {
                    $set: updatedData
                },
                {
                    new: true
                }
            );

            if (!userAccount) {
                return Responses.sendErrorResponse(res, 'Error Update Detail Account', { "message": "Cannot find a account" }, 400);
            }

            return Responses.sendSuccessResponse(res, 'Success Update Detail Account', userAccount, 200);
        } else {
            return Responses.sendErrorResponse(res, 'Error Update Detail Account', { "message": "Cannot find a account" }, 400);
        }

    } catch (error) {
        return Responses.sendErrorResponse(res, 'Error Update Detail Account', error, 400);
    }
}

// @desc GET Update Detail Account By Id
// @route POST - /account/update-detail-account/:id
// @access private
const deleteAccountByUserId = async (req, res) => {
    const { id } = req.params;

    try {
        if (mongoose.Types.ObjectId.isValid(id)) {
            const userAccount = await Account.deleteOne(
                {
                    _id: id,
                    user_id: req.userId
                }
            );

            if (userAccount.deletedCount === 0) {
                return Responses.sendErrorResponse(res, 'Error Delete Account', { "message": "Cannot find a account" }, 400);
            }

            return Responses.sendSuccessResponse(res, 'Success Delete Account', userAccount, 200);
        } else {
            return Responses.sendErrorResponse(res, 'Error Delete Account', { "message": "Cannot find a account" }, 400);
        }

    } catch (error) {
        return Responses.sendErrorResponse(res, 'Error Delete Account', error, 400);
    }
}

module.exports = { createAccount, getAccountByUserId, updateAccountByUserId, deleteAccountByUserId }