/**
 *  gitShowBranchParser: a simple tool to parse the output of `git show-branch` into useful JSON
 */
var fs = require('fs');
var Promise = require('rsvp').Promise;
var _ = require('underscore');

module.exports = (function () {
    var createBranchFromLine = function(line) {
        return {
            label: line.match(/\[([^\]]*)\]/)[1],
            latestCommit: line.match(/\] *(.*)/)[1]
        };
    };

    var createCommitFromLine = function(line) {
        return {
            label: line.match(/\[([^\]]*)\]/)[1],
            commitMessage: line.match(/\] *(.*)/)[1],
            branches: line.slice(0, line.indexOf(' [')).split("")
                .map(function(letter){ return letter !== ' '; })
        };
    };

    var readFilePromise = function (path, options) {
        return new Promise(function promiseifyReadFile (res, rej) {
            fs.readFile(
                path,
                options?options:{},
                function handleReadFile (err, data) {
                    if (err) {
                        rej(err);
                    } else {
                        res(data);
                    }
                }
            );
        });
    };

    var parser = function (pathToOutput, callback) {
        return readFilePromise(pathToOutput)
            .then(function parseBuffer (buffer) {
                var lines, splitLines;
                
                // Read buffer and split into separate lines
                lines = buffer.toString().split('\n');

                // Separate header lines (branches) from rows (commits)
                splitLines = {
                    branchLines : textLines.splice(0, textLines.indexOf('---')),
                    commitLines : textLines.splice(1).filter(function(line){return !line.match(/^ *$/);})
                };

                // Return parsed object
                return {
                    branches: splitLines.branchLines.map(createBranchFromLine),
                    commits: splitLines.commitLines.map(createCommitFromLine)
                };
            }).then ( function executeCallback (processedObj) {
                if (_.isFunction(callback)) {
                    callback(null, processedObj);
                }
                return processedObj;
            }).catch(function catchParseError (err) {
                callback(err);
            });
    };
    /*
    var parser = function (pathToOutput, callback) {
        return readFilePromise(pathToOutput)
            .then(function convertAndSplit (buffer) {
                return buffer.toString().split('\n');
            }).then(function separateBranchesFromCommits (outputLines) {
                return {
                    branchLines : textLines.splice(0, textLines.indexOf('---')),
                    commitLines : textLines.splice(1).filter(function(line){return !line.match(/^ *$/);})
                };
            }).then(function processLines(splitLines) {
                return {
                    branches: splitLines.branchLines.map(createBranchFromLine),
                    commits: splitLines.commitLines.map(createCommitFromLine)
                }
            }).then ( function executeCallback (processedObj) {
                if (_.isFunction(callback) {
                    callback(null, processedObj);
                };
                return processedObj;
            });
    };
    */

    return parser;
})();



