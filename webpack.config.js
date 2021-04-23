

module.exports = {
    //'development' 'production'
    mode: 'development',
    entry: {
        main: ['@babel/polyfill', './app/js/main.js']
    },
    output: {
        filename: 'script.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties'
                        ]
                    }
                }
            }
        ]
    }
}
