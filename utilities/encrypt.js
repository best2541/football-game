const bcrypt = require('bcrypt')
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt()
    const hashedPassword =await bcrypt.hash(password, salt)
    return hashedPassword
}
module.exports = encryptPassword