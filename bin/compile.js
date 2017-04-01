/**
 * Created by pc on 2017/1/9.
 */
var path = require('path')
var babelCliDir = require('babel-cli/lib/babel/dir')
require('colors')
console.log('>>> : Compiling...'.green)
babelCliDir({outDir: 'app/', retainLines: true, sourceMaps: true}, ['src/']) // compile all when start


console.log('>>> compile success'.green)

process.exit();