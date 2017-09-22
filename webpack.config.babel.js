import { DefinePlugin } from 'webpack';
import libpath from 'path';
import ButternutWebpackPlugin from 'butternut-webpack-plugin';

const context = libpath.join(__dirname, 'src');
const dst = 'app/dst';
const generateScopedName = '[name]__[local]';

export default {
	entry: context,
	output: {
		path: libpath.join(__dirname, dst),
		filename: 'index.js'
	},
	module: {
		loaders: [
			{
				test: /\.json$/,
				loader: 'json-loader'
			},
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['react'],
						plugins: [
							'transform-decorators-legacy',
							['react-css-modules',
								{
									context,
									generateScopedName,
									filetypes: {
										'.scss': {
											syntax: 'postcss-scss'
										}
									}
								}]
						]
					}
				}
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					`css-loader?importLoader=1&modules&localIdentName=${generateScopedName}`,
					'postcss-loader',
					'sass-loader'
				]
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	plugins: [
		new DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify('production')
			}
		}),
		new ButternutWebpackPlugin({})
	],
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM'
	},
	node: {
		__filename: false,
		__dirname: false
	},
	target: 'electron'
};