const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')

const infoColor = (_message) => {
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

module.exports = merge(commonConfiguration, {
    mode: 'development',
    devServer: {
        host: 'localhost', // Changed to localhost
        port: 5176,        // Fixed port 5176
        contentBase: './dist',
        watchContentBase: true,
        open: true,
        https: false,
        overlay: true,
        noInfo: true,
        after: function(app, server, compiler) {
            const port = server.options.port
            const https = server.options.https ? 's' : ''
            const domain = `http${https}://localhost:${port}`
            console.log(`Project running at:\n  - ${infoColor(domain)}`)
        }
    }
})
