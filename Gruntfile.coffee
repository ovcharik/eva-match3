module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    coffee:
      compile:
        options: sourceMap: true
        files:
          'app.js': ['src/scripts/base/**/*.coffee', 'src/scripts/app/**/*.coffee', 'src/scripts/init.coffee']

    sass:
      compile:
        files:
          'styles.css': 'src/styles/styles.scss'

    jade:
      compile:
        files:
          'index.html': 'src/layouts/index.jade'
      templates:
        options:
          client: true
          namespace: 'templates'
          processName: (filename) ->
            filename.replace(/^src\/scripts\/templates\/(.*)\.jade$/, '$1')
        files:
          'templates.js': 'src/scripts/templates/**/*.jade'

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
      templates:
        files: ['src/scripts/templates/**/*.jade']
        tasks: ['jade:templates']
      sass:
        files: ['src/**/*.scss']
        tasks: ['sass:compile']
      jade:
        files: ['src/layouts/**/*.jade']
        tasks: ['jade:compile']

  grunt.loadNpmTasks(name) for name of grunt.config.get('pkg.devDependencies') when /^grunt.+/.test(name)
  grunt.registerTask 'default', ['connect']
