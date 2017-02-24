'use strict';

module.exports = function (grunt) {


  // Time how long tasks take. Can help when optimizing build times

  grunt.loadNpmTasks('grunt-wiredep');

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

    // Automatically inject Bower components into the app
  grunt.initConfig({
    wiredep: {
      task:{
        src: ['app/index.html'],
        ignorePath:  /\.\.\//,

      options: {
        devDependencies: true,
        ignorePath:  /\.\.\//,
        fileTypes:{
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
              detect: {
                js: /'(.*\.js)'/gi
              },
              replace: {
                js: '\'{{filePath}}\','
              }
            }
          }
      }
}
    }
});
}
