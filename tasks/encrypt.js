/*
 * grunt-encrypt
 * https://github.com/charlie/grunt-encrypt
 *
 * Copyright (c) 2014 charliedowler
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var crypto = require('crypto');
  var path = require('path');
  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('encrypt', 'The best Grunt plugin ever.', function() {    
    // Merge task-specific and/or target-specific options with these defaults.
    var opts = this.options();
    if (!opts.key) {
      grunt.fail.warn('Missing key property.');
    }
    var key = opts.key;

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {        
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          var filename = path.basename(filepath, path.extname(filepath));
          var newDirname = path.join(opts.dest, path.dirname(filepath));
          var newFilename = [
            path.join(newDirname, filename),
            opts.ext ? opts.ext : 'encrypted'
          ].join('.'); 

          var contents = grunt.file.read(filepath);

          if (!opts.decrypt) {
            var cipher = crypto.createCipher('aes-256-cbc', key)
            contents = cipher.update(contents, 'utf8', 'base64');
            contents += cipher.final('base64')
          }
          else {
            var decipher = crypto.createDecipher('aes-256-cbc', key);
            contents = decipher.update(contents, 'base64', 'utf8');
            contents += decipher.final('utf8');
            var ext = filepath.split('.');
            ext = ext[ext.length - 1];
            newFilename = newFilename.split('.' + ext).join('');
          }
          grunt.file.write(newFilename, contents);
          return true;
        }
      });

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
