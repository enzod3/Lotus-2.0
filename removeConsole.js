const fs = require('fs')

fs.readFile('main.js', 'utf8', function(err, data) {
    code = data
    let re = /(console.log\(.*\))/gm
    codeArray = code.match(re)
    for(let e in codeArray){
        code = code.replace(codeArray[e], '')
        global.count += 1
    }
    fs.writeFile('mainNoConsole.js',code, function (err) {
        if (err) throw err;
        console.log('Saved!');
      });

});

