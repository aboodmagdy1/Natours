const path = require('path')

module.exports = {
    entry: './public/js/login.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.js'
    }
}
