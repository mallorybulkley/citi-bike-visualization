var path = require('path');

module.exports = {
    entry: './lib/citi_bike_viz.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.bundle.js'
    }
};
