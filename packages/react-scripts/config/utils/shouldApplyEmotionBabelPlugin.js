const fs = require('fs');
const path = require('path');

const paths = require('../paths');

const modulesToBePresent = [
	'babel-plugin-emotion',
	'@emotion/core'
]

const areAllModulesPresent =
	!modulesToBePresent.find(module =>
		!fs.existsSync(
			path.resolve(paths.appNodeModules, module)
		)
	)

module.exports = areAllModulesPresent