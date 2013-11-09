'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt, 'grunt-!(cli)');

  grunt.initConfig({
    release: {
      options: {
        github: {
          repo: 'shahata/servus',
          usernameVar: 'GITHUB_USERNAME',
          passwordVar: 'GITHUB_PASSWORD'
        }
      }
    }
  });
};