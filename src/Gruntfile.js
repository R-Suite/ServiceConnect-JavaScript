module.exports = function(grunt) {

    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),
        
        jsbeautifier: {
            files: ["src/**"],
            options: {}
        },

        watch: {
            files: ["src/**"],
            tasks: ['default']
        }
    });
   
    grunt.registerTask('default', ['jsbeautifier']);

};
