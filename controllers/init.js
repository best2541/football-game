module.exports = {
    init: (req, res, next) => {
        req.datas = {}
        next()
    },
    sendData: (req, res) => {
        res.send(req.datas)
    },
    test: (req, res, next) => {
        req.data.test = 'ok'
        next()
    }
}