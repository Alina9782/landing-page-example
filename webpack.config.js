const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemovePlugin = require('remove-files-webpack-plugin');

module.exports = (env = {}) => {
	const isDev = env.development === true;
	// Override with e.g. `--env location=src/OTHER_LOCALE` for another market build.
	const projectDirectory = path.resolve(__dirname, env.location || 'src/US');

	return {
		mode: isDev ? 'development' : 'production',
		entry: `${projectDirectory}/index.js`,
		output: {
			filename: 'bundle.js',
			path: path.resolve(__dirname, 'dist'),
			publicPath: isDev ? '/' : './',
			clean: true,
		},
		module: {
			rules: [
				{
					test: /\.scss$/,
					use: [
						isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
						'css-loader',
						'sass-loader',
					],
				},
				{
					test: /\.(png|jpe?g|gif|svg|ico)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'assets/[name][ext]',
					},
				},
				{
					test: /\.css$/,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.(woff(2)?|ttf|eot|otf)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'assets/[name][ext]',
					},
				},
			],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: `${projectDirectory}/index.html`,
				inject: 'body', // Inject at the end of body tag
				...(!isDev && {
					excludeAssets: [/\.js/, /\.css/], // Exclude unnecessary tags
					minify: false,
				}),
			}),
			!isDev && new MiniCssExtractPlugin(),
			!isDev && new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/\.(js|css)$/]),
			new CopyPlugin({
				patterns: [{ from: `${projectDirectory}/assets`, to: 'assets/[name][ext]' }],
			}),
			!isDev &&
				new RemovePlugin({
					after: {
						root: './dist',
						include: ['bundle.js'], // Delete file in prod
					},
				}),
		].filter(Boolean),
		devServer: {
			static: {
				directory: projectDirectory,
				watch: true,
			},
			compress: true,
			port: 9000,
			hot: true,
			client: {
				overlay: {
					errors: true,
					warnings: false,
				},
			},
		},
	};
};
