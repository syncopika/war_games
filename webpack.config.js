// helpful:
// https://www.robinwieruch.de/minimal-react-webpack-babel-setup/
// https://www.valentinog.com/blog/webpack/

module.exports = {
	entry: './index.js',
	module: {
	  rules: [
		{
		  test: /\.(js)$/,
		  exclude: /node_modules/,
		  use: ['babel-loader']
		}
	  ]
	},
	resolve: {
		extensions: ['*', '.js']
	},
	output: {
		path: __dirname + '/dist',
		publicPath: '/',
		filename: 'bundle.js'
	}
	
};