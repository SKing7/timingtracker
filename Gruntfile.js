/*global module:false,require: false*/
var _ = require('lodash');

module.exports = function(grunt) {
  var packagejson = grunt.file.readJSON('package.json');
  var depVars = _.pluck(packagejson.deps, 'var'); 
  var depsStr = _.pluck(packagejson.deps, 'name'); 
  depsStr.forEach(function (v, k) {
    depsStr[k] = '"' + v + '"';
  });
  grunt.initConfig({
    depVars: depVars.join(","),
    depsStr: depsStr.join(","),
    pkg: packagejson,
    banner: '/*\n * <%= pkg.title || pkg.name %> v<%= pkg.version %> | JavaScript TimingTracker Library\n *\n * Copyright 2015 liuzhe.pt<@alibaba-inc.com> - All rights reserved.\n * Dual licensed under MIT and Beerware license \n *\n * :: <%= grunt.template.today("yyyy-mm-dd HH:MM") %>\n */\n',
    concat: {
      options: {
        banner: '/*global define*/\n<%= banner %>'+';(function (name, factory) {\nif (typeof define === "function" && define.amd) {\n    define(name, [<%= depsStr %>], factory);\n  } \n})("<%= pkg.moduleName %>", function (<%= depVars %>) {\n',
        footer: '\n\n});'
      },
      dist: {
        src: packagejson.buildFiles,
        dest: 'build/timingtracker.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>',
        mangle: true,
        compress: false,
        beautify: false
      },
      dist: {
        src: 'build/timingtracker.js',
        dest: 'build/timingtracker.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        //latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      buildFile: {
        src: 'build/timingtracker.js'
      },
      //srcs: {
      //  src: 'src/*.js'
      //}
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      dist: {
        files: packagejson.buildFiles.concat('Gruntfile.js'),
        tasks: ['concat', 'jshint', 'uglify', 'copy:toM']
      }
    },
    copy: {
      npmPreRelease: {
        files: [
          { flatten: true, expand: true, src: 'build/*', dest: 'dist/' },
        ]
      },
      toM: {
        files: [
          { src: 'build/timingtracker.js', dest: '../mobile/src/lib/common/timingtracker.js' },
        ]
      } 
    },
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-shell');


  grunt.registerTask('default', ['concat', 'jshint', 'watch']);
  grunt.registerTask('build', ['concat', 'jshint', 'uglify']);
};
