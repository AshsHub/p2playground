const path = require('path');
const build = require('@goodboydigital/fido-build');

var args = {};

process.argv.forEach(function (val, index, array) {
	args[val] = true;
});

const config = {

	resolve: {
		alias: {
			'pixi.js': path.join(process.cwd(), './src/scripts/lib/pixi.js'),
		},
	},

};

if (args.production) {
	build.startupProduction(config);
} else {
	build.startupDevelopment(config);
}