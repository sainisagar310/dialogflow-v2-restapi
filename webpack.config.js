const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const processenv = require(`./config/config.${process.env.NODE_ENV}.js`);

const host = ["http", "localhost", 1200];
const url = `${host[0]}://${host[1]}:${host[2]}`;
const mode = process.env.NODE_ENV === "dev" ? "development" : "production";
const minify = mode !== "development";

module.exports = {
	mode: mode,
	entry: {
		app: ["./src/index.tsx"]
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "[name].[hash].js",
		chunkFilename: "[name].[hash].js"
	},
	devServer: {
		hot: true,
		host: host[1],
		port: host[2],
		proxy: {
			"/api/*": {
				target: processenv.SERVICE_URL.replace(/"/g, ""),
				secure: false,
				logLevel: "debug",
				changeOrigin: true,
				pathRewrite: { "^/api": "" }
			}
		},
		historyApiFallback: true
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx|js|jsx)$/,
				exclude: /node_modules\/(?!api-ai-javascript)/,
				loader: "ts-loader",
				options: {
					transpileOnly: true
				}
			},
			{
				test: /\.(scss|css)$/,
				use: [
					minify ? MiniCssExtractPlugin.loader : "style-loader",
					{ loader: "css-loader", options: { sourceMap: true } },
					{ loader: "sass-loader", options: { sourceMap: true } }
				]
			},
			{
				test: /\.(gif|png|jpe?g|svg|ttf|otf|woff|woff2|eot|xlsx)$/i,
				use: [
					{
						loader: "url-loader",
						options: {
							limit: 50000, // Do not convert image to base64
							name: "[name]-[hash].[ext]",
							fallback: "file-loader",
							outputPath: "public/assets"
						}
					}
				]
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: "html-loader"
					}
				]
			}
		]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new webpack.DefinePlugin({
			"process.env": processenv
		}),
		new HtmlWebPackPlugin({
			template: "./src/index.html",
			filename: "./index.html",
			minify: minify && {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				useShortDoctype: true
			}
		}),
		new MiniCssExtractPlugin({
			filename: minify ? "[name].[contenthash].css" : "[name].css",
			chunkFilename: "[id].css"
		}),
		new webpack.HotModuleReplacementPlugin()
	],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				cache: true,
				parallel: true,
				sourceMap: true,
				uglifyOptions: {
					output: {
						comments: false
					}
				}
			}),
			new OptimizeCSSAssetsPlugin({})
		]
	},
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx"],
		alias: {
			"@app": path.resolve(__dirname, "./src/")
		},
		modules: [path.join(__dirname, "src"), "node_modules"]
	},
	externals: {}
};
