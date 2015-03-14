module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    coffee:
      compile:
        files:
          'app.js': ['src/scripts/base/**/*.coffee', 'src/scripts/app/**/*.coffee', 'src/scripts/init.coffee']

    sass:
      options: sourcemap: 'none'
      compile:
        files:
          'styles.css': 'src/styles/styles.scss'

    jade:
      compile:
        files:
          'index.html': 'src/layouts/index.jade'

    connect:
      server:
        options:
          port: 9000
          keepalive: true
          livereload: true

    watch:
      options:
        atBegin: true
        livereload: true
      coffee:
        files: ['src/**/*.coffee']
        tasks: ['coffee:compile']
      sass:
        files: ['src/**/*.scss']
        tasks: ['sass:compile']
      jade:
        files: ['src/layouts/**/*.jade']
        tasks: ['jade:compile']

  grunt.loadNpmTasks(name) for name of grunt.config.get('pkg.devDependencies') when /^grunt.+/.test(name)
  grunt.registerTask 'default', ['connect']
