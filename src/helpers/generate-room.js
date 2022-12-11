const randomString = require('randomstring')

function generateRoom() {
    const str1 = randomString.generate({
        length: 3,
        charset: 'abcdefghijklmnopqrstuvwxyz'
    })
    const str2 = randomString.generate({
        length: 3,
        charset: 'abcdefghijklmnopqrstuvwxyz'
    })
    const str3 = randomString.generate({
        length: 3,
        charset: 'abcdefghijklmnopqrstuvwxyz'
    })
    return str1 + '-' + str2 + '-' +  str3
}

module.exports = generateRoom