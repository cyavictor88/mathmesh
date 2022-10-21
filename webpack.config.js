const path = require("path");
const fs = require("fs");
const appDirectory = fs.realpathSync(process.cwd());
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
module.exports = {
    devtool: 'inline-source-map',  // vic to surpress firefox thousands of warning about "Source Maps not working with Webpack" https://stackoverflow.com/questions/37928165/source-maps-not-working-with-webpack
    entry: path.resolve(appDirectory, "src/index.ts"), //path to the main .ts file
    // output: {
    //     filename: "js/mathtext.js", //name for the js file that is created/compiled in memory
    //     clean: true,
    // },

    output: {
        library: 'mathmesh',
        libraryTarget: 'umd',
        filename: 'mathmesh.js',
        auxiliaryComment: 'Test Comment',
        globalObject: 'this',
        umdNamedDefine:true,
        clean: true,
      },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        // fallback: {
            // "fs": false
        // },
    },
    
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
   

    mode: "production",
};