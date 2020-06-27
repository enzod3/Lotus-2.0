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
    $('.keyInputBox')[0].value = ""
}

//add account popupfunctions
var accountInput = document.getElementsByClassName("keyInputBox")[0];
accountInput.addEventListener("keyup",function(e){
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        e.preventDefault();
        // Trigger the button element with a click
        processKey(e)
      }
})




ipcRenderer.on('key:reset', function(e){
    console.log('reset')
    $('#errorMessage').text( "Key already activated, reset on dashboard")
})

ipcRenderer.on('key:invalid', function(e){
    $('#errorMessage').text( "Invalid Key")

})



