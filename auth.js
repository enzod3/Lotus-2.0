const electron = require('electron');
var shell = require('electron').shell;
const {ipcRenderer} = electron;
window.$ = window.jQuery = require("./plugins/jquery.js")

const closeButton = document.querySelector('#close')
closeButton.addEventListener('click', closeWindow)
const miniButton = document.querySelector('#mini')
miniButton.addEventListener('click', miniWindow)





function closeWindow(e){
    ipcRenderer.send('auth-close')
}
function miniWindow(e){
    ipcRenderer.send('auth-minimize')
}


function processKey(e){
    var key = $('.keyInputBox')[0].value
    console.log(key)
    ipcRenderer.send('newKey',key)
}