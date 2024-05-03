const validate = require('../utilities/validate')
const DeviceDetector = require('device-detector-js')
const BotDetector = require('device-detector-js/dist/parsers/bot')

const deviceDetector = new DeviceDetector();
const botDetector = new BotDetector();

module.exports = {
    save: (req, res, next) => {
        const datas = req.query
        knex('hard_setting')
            .update(datas)
            .then(async result => {
                const update = await knex('hard_setting').select('*')
                res.json(update)
            })
            .catch(err => {
                res.sendStatus(400)
            })
    }
}