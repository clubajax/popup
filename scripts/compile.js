var
    files,
    fs = require('fs'),
    dir = './src',
    ordered = ['popup.js', 'util.js'];

function stripIIFE (file) {
    file = file.substring(file.indexOf('(function('));
    file = file.substring(file.indexOf('\n'));
    file = file.substring(0, file.lastIndexOf('}(window'));
    return file;
}
fs.readdirSync(dir).forEach(function(fileName) {
    if(ordered.indexOf(fileName) === -1){
        ordered.push(fileName);
    }
});

files = ordered.map(function (fileName) {
    return fs.readFileSync(dir + '/' + fileName).toString();
});

files.forEach(function (file) {
    var lines = file.split('\n');
});

var test = fs.readFileSync(dir + '/fade.js').toString();
console.log(stripIIFE(test));