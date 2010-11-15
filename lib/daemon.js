/*
 * daemon.js: Wrapper for C++ bindings
 *
 * (C) 2010 and Charlie Robbins
 * MIT LICENCE
 *
 */

var fs = require('fs'),
    binding = require('../build/default/daemon'),
    daemon = exports;

//
// Export the raw bindings directly
//
Object.keys(binding).forEach(function (k) { daemon[k] = binding[k] });

// 
// function run (out, lock, callback)
//   Run is designed to encapsulate the basic daemon operation in a single async call.
//   When the callback returns you are in the the child process.
//
daemon.run = function (out, lock, callback) {
  fs.open(out, 'w+', function (err, fd) {
    if (err) return callback(err);
    
    try {
      daemon.start(fd);
      daemon.lock(lock);
      callback(null, true);
    }
    catch (ex) {
      callback(ex);
    }
  });
};
  
// 
// function lock (lock, callback)
//   Asynchronously stop the process in the lock file and 
//   remove the lock file
//
daemon.stop = function (lock, callback) {
  fs.readFile(lock, function (err, data) {
    if (err) return callback(err);
    
    try {
      // Stop the process with the pid in the lock file
      var pid = parseInt(data.toString());
      process.kill(pid);
      
      // Remove the lock file
      fs.unlink(lock, function (err) {
        if (err) return callback(err);
        callback(null, pid);
      });
    }
    catch (ex) {
      callback(ex);
    }
  });
};
