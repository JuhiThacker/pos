const bcrypt = require('bcrypt');
const { User } = require('../models');

const createUser = async (req, res) => {
    try {
        const {
            username,
            password,
            status_id
        } = req.body;

        // Validate required fields
        if (!username || !password || !status_id) {
            return res.status(400).json({
                success: false,
                message: 'Username, password and status_id are required'
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({
            where: {
                username: username
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            username: username,
            password_hash: passwordHash,
            status_id: status_id
        });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user.id,
                username: user.username,
                status_id: user.status_id
            }
        });

    } catch (error) {
        console.error('Create user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create user'
        });
    }
};

module.exports = {
    createUser
};
