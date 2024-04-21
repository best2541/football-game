const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validate = require('../utilities/validate')
module.exports = {
    test: (req, res) => {
        res.send(req.user)
    },
    auth: (req, res) => {
        validate(req, ['username', 'password']).then(() => {
            knex('admin')
                .select('username', 'password')
                .where('username', req.body.username)
                .then(async result => {
                    if (result[0]) {
                        const { username, password } = result[0]
                        const validPassword = await bcrypt.compare(req.body.password, password);
                        if (validPassword) {
                            // Send JWT
                            const token = jwt.sign({ username, password, role: 'admin' }, process.env.SECRET, { expiresIn: '1d' })
                            return res.send(token)
                        } else {
                            // handle error
                            res.send({ err: 'password ไม่ถูกต้อง' })
                        }
                    } else {
                        res.send({ err: 'username ไม่มีในระบบ' })
                    }
                })
            // .catch(err => console.log(err))
        }).catch(err => res.send({ err }))
    },
    getProfile: (req, res, next) => {
        knex('profile')
            .select(['uid', 'phone', 'name', 'score'])
            .orderBy('score', 'desc')
            .then(result => {
                req.datas.users = result
                next()
            })
            .catch((err) => {
                res.status(500).send({ err: err.message })
            })
    }
}