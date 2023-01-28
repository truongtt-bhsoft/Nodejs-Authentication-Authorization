const _ = require("lodash");
const bcrypt = require("bcrypt");
const { User } = require("../models/users");
const Joi = require("joi");
const express = require("express");
const router = express.Router();
const asyncMiddleware = require("../middleware/async");

const SITE_URL = process.env.SITE_URL;
const API_KEY = process.env.API_SEND_MAIL_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL_SEND;

// test send email start
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: API_KEY,
    },
  })
);

/**
 * @swagger
 * /api/auth/reset-password-request:
 *  post:
 *      tags:
 *          - Auth
 *      description: request to change password
 *      parameters:
 *          - in: body
 *            name: user
 *            description: The user request to change password.
 *            schema:
 *              type: object
 *              required:
 *                  - email
 *              properties:
 *                  email:
 *                      type: string
 *      responses:
 *          '200':
 *              description: Sent email.
 *          '400':
 *              description: This email has not registered yet.
 */
router.post(
  "/reset-password-request",
  asyncMiddleware(async (req, res) => {
    const { error } = validateEmail(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send("This email has not registered yet.");

    const resetToken = user.generateResetToken();
    const expirationTokenDate = Date.now() + 180000;

    user.resetToken = resetToken;
    user.resetTokenExpiration = expirationTokenDate;

    await user.save();

    transporter
      .sendMail({
        to: user.email,
        from: FROM_EMAIL,
        subject: "You requested a reset password request",
        html: `<a href='${SITE_URL}/reset-password?token=${resetToken}&id=${user._id}'>${SITE_URL}/reset-password?token=${resetToken}&id=${user._id}</a>`,
      })
      .then((result) => {
        res.send("Check your email");
      })
      .catch((err) => {
        res.status(400).send("Something wrong!");
      });
  })
);

/**
 * @swagger
 * /api/auth/authorization-reset-password-request:
 *  post:
 *      tags:
 *          - Auth
 *      description: request to change password after got reset token
 *      parameters:
 *          - in: body
 *            name: user
 *            description: The user request to change password.
 *            schema:
 *              type: object
 *              required:
 *                  - id
 *                  - token
 *                  - password
 *              properties:
 *                  id:
 *                      type: string
 *                  token:
 *                      type: string
 *                  password:
 *                      type: string
 *      responses:
 *          '200':
 *              description: Changed password.
 *          '400':
 *              description: No user email or reset password request or token has been expired.
 */
router.post(
  "/authorization-reset-password-request",
  asyncMiddleware(async (req, res) => {
    const { error } = validatePassword(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({
      _id: req.body.id,
      resetToken: req.body.token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .send(
          "No user email or reset password request or token has been expired"
        );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.status(200).send("Changed password");
  })
);

// test send email end

const validate = async (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(req, schema);
};

const validateEmail = async (req) => {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
  };

  return Joi.validate(req, schema);
};

const validatePassword = async (req) => {
  const schema = {
    password: Joi.string().min(5).max(255).required(),
    id: Joi.string().min(1).max(200).required(),
    token: Joi.string().min(1).max(500).required(),
  };

  return Joi.validate(req, schema);
};

/**
 * @swagger
 * /api/auth/:
 *  post:
 *      tags:
 *          - Auth
 *      description: log in
 *      parameters:
 *          - in: body
 *            name: user
 *            description: The user account login detail.
 *            schema:
 *              type: object
 *              required:
 *                  - email
 *                  - password
 *              properties:
 *                  email:
 *                      type: string
 *                  password:
 *                      type: string
 *      responses:
 *          '200':
 *              description: Successfull loged in
 *          '400':
 *              description: Invalid email or password.
 */
router.post(
  "/",
  asyncMiddleware(async (req, res) => {
    const { error } = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password.");

    const isValid = await bcrypt.compare(req.body.password, user.password);

    if (!isValid) return res.status(400).send("Invalid email or password.");

    const token = user.generateAuthToken();

    res.send(token);
  })
);

module.exports = router;
