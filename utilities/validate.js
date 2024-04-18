const validate = async (req, filter) => {
    let missing = []
    await filter.map(a => {
        if (!req.body[a])
            missing.push(a)
    })
    if (missing.length > 0) {
        throw new Error(`missing : ${missing}`)
    }
}
module.exports = validate