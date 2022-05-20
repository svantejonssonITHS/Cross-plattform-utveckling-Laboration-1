// External dependencies
const express = require('express');
const router = express.Router();

// Internal dependencies
const { Op } = require('sequelize');
const { UserModel } = require('../models');
const { passport } = require('../config/passport');

/**
 * @api {get} /api/user/ Get all users
 */
router.get('/', async (req, res) => {
	const { ids, names, emails } = req.query;

	const conditions = {};

	if (ids) conditions.id = { [Op.in]: ids.split(',') };

	if (names) conditions.name = { [Op.in]: names.split(',') };

	if (emails) conditions.email = { [Op.in]: emails.split(',') };

	try {
		const users = await UserModel.findAll({ where: conditions });
		res.status(200).json({
			success: true,
			message: 'Users retrieved successfully',
			data: users
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message
		});
	}
});

/**
 * @api {post} /api/user/register Create a new user
 */
router.post('/register', async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Please provide all required fields'
		});
	}

	try {
		const user = await UserModel.create({ name, email, password });
		res.status(200).json({
			success: true,
			message: 'User created successfully',
			data: [user]
		});
	} catch (error) {
		if (error.name === 'SequelizeUniqueConstraintError') {
			return res.status(400).json({
				success: false,
				message: 'Provided email is already in use'
			});
		} else if (error.name === 'SequelizeValidationError' && error.errors[0].path === 'email') {
			return res.status(400).json({
				success: false,
				message: 'Provided email is not valid'
			});
		} else {
			res.status(500).json({
				success: false,
				message: error
			});
		}
	}
});

/**
 * @api {post} /api/user/login Login a user
 */
router.post('/login', async (req, res) => {
	passport.authenticate('local', (error, user) => {
		if (error) {
			return res.status(500).json({
				success: false,
				message: error
			});
		} else if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Incorrect email or password'
			});
		} else {
			req.login(user, (error) => {
				if (error) {
					return res.status(500).json({
						success: false,
						message: error
					});
				}
				return res.status(200).json({
					success: true,
					message: 'User logged in successfully',
					data: [user]
				});
			});
		}
	})(req, res);
});

module.exports = router;