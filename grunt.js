module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      dist: {
        src: ['src/intro.js', 'src/exports.js', 'src/middle.js', 'src/noam.util.js', 'src/noam.fsm.js', 'src/noam.grammar.js', 'src/noam.re.js', 'src/outro.js'],
        dest: 'lib/noam.js'
      }
    },
    
    lint: {
      all: ['lib/noam.js', 'test/*.js', 'benchmarks/*.js']
    },

    min: {
      dist: {
        src: ['lib/noam.js'],
        dest: 'lib/noam.min.js'
      }
    },
    
    jasmine_node: {
      specFolderName: "./test",
      projectRoot: ".",
      requirejs: false,
      forceExit: true,
      jUnit: {
        report: false,
        savePath : "./build/reports/jasmine/",
        useDotNotation: true,
        consolidate: true
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-jasmine-node');

  // Default task.
  grunt.registerTask('default', 'concat jasmine_node min lint');

};