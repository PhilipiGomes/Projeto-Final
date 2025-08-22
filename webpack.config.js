const path = require("path");
const output_path = path.resolve(__dirname, "dist");
module.exports = {
    entry: "./src/index.js",
    optimization: {
        usedExports: true
    },
    output: {
        filename: "timeline.js",
        path: path.join(output_path, 'js'),
        library: "TL" // https://webpack.js.org/configuration/output/#outputlibrary
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        }
    },
    module: {
        rules: [{
                test: /\.less$/,
                use: [{
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                        }
                    },
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../css/icons'
                    }
                }]
            }
        ]
    }
};