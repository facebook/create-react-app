var gulp = require('gulp');

/**
 * IMPORTANT NOTE
 * This code should not be removed to have augle build npm tasks.
 */
/******* Start of augle tasks registering *******/
var augleTasks = require('augle-arpk-build');
gulp.registry(augleTasks);
/******* End of augle tasks registering *********/