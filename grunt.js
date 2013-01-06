module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    concat: {
      node: {
        src: ['src/intro.js',
              'src/exports.js',
              'src/middle.js',
              'src/noam.util.js',
              'src/require-structure.js',
              'src/noam.fsm.js',
              'src/noam.grammar.js',
              'src/noam.re.js',
              'src/outro.js'],
        dest: 'lib/node/noam.js'
      },
      browser: {
        src: ['src/intro.js',
              'src/exports.js',
              'src/middle.js',
              'src/noam.util.js',
              'node_modules/structure.js/lib/inline-hashtable.js',
              'src/after-inline-hashtable.js',
              'src/noam.fsm.js',
              'src/noam.grammar.js',
              'src/noam.re.js',
              'src/outro.js'],
        dest: 'lib/browser/noam.js'
      }
    },

    lint: {
      all: ['src/exports.js', 'src/noam.util.js', 'src/noam.fsm.js', 'src/noam.grammar.js', 'src/noam.re.js', 'test/*.js', 'benchmarks/*.js']
    },

    min: {
      node: {
        src: ['lib/node/noam.js'],
        dest: 'lib/node/noam.min.js'
      },
      browser: {
        src: ['lib/browser/noam.js'],
        dest: 'lib/browser/noam.min.js'
      }
    },

    jasmine_node: {
      specFolderName: "",
      projectRoot: "./test",
      requirejs: false,
      forceExit: true,
      matchall: true,
      verbose: false
    },

    jsvalidate: {
      files: ['src/exports.js', 'src/noam.util.js', 'src/noam.fsm.js', 'src/noam.grammar.js', 'src/noam.re.js', 'test/*.js', 'benchmarks/*.js']
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        indent: 2,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        quotmark: "single",
        undef: true,
        unused: true,
        trailing: true,
        maxlen: 100
      },
      globals: {
        console: true,
        require: true,
        define: true,
        requirejs: true,
        describe: true,
        expect: true,
        it: true
      }
    },

    /* // currently unused
    beautify: {
      tests: ['test/*.js', 'benchmarks/*.js'],
      files: ['lib/noam.js']
    },

    beautifier: {
      options: {
        indentSize: 2,
        indentChar: ' ',
        preserveNewlines: true,
        bracesOnOwnLine: false,
        keepArrayIndentation: false,
        spaceAfterAnonFunction: true,
        indentLevel: 0
      },
      tests: {
        options: {
          indentSize: 2,
          indentChar: ' ',
          preserveNewlines: true,
          bracesOnOwnLine: false,
          keepArrayIndentation: false,
          spaceAfterAnonFunction: true,
          indentLevel: 0
        }
      }
    }*/

  });

  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-jsvalidate');
  // grunt.loadNpmTasks('grunt-beautify');

  // Default task.
  grunt.registerTask('default', 'jsvalidate lint concat jasmine_node min');

};
