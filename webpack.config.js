const path = require('path');

module.exports = {
    mode: 'production',
    entry: './public/renderer.ts',
    target: 'electron-renderer',
    devtool: 'source-map',
    optimization: {
        minimize: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        filename: 'renderer.js',
        path: path.resolve(__dirname, 'dist/public')
    }
}; 