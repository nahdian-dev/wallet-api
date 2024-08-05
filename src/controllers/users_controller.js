// @desc POST login
// @route POST - /users/login
// @access public
const login = async (req, res) => {
    res.status(200).json({
        "access_token": "123",
    });
}

module.exports = { login }