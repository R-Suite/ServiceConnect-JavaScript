module.exports = function(grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        
        jsbeautifier: {
            files: ["src/**/*.js", "samples/**/*.js", "!src/bower_components/**"],
            options: {}
        },

        jshint: {
            files: ["src/**/*.js", "samples/**/*.js", "!src/bower_components/**"]
        },

        watch: {
            files: ["src/**", "samples/**"],
            tasks: ['default']
        }
    });
   
    grunt.registerTask('default', ['jsbeautifier', 'jshint']);

};
