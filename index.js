const electron = require('electron');
const { ipcMain } = require('electron');
var shell = require('electron').shell;
const {ipcRenderer} = electron;
window.$ = window.jQuery = require("./plugins/jquery.js")
window.move = require("./plugins/move.js-master/move.js")


const closeButton = document.querySelector('#close')
closeButton.addEventListener('click', closeWindow)
const miniButton = document.querySelector('#mini')
miniButton.addEventListener('click', miniWindow)
//const settingsButton = document.querySelector(".settings-button")
//settingsButton.addEventListener('click', openSettings)



$(".accountInputBox").on('input', function(){

    handle = document.getElementsByClassName("accountInputBox")[0].value
    var headtwitterPreview = document.getElementsByClassName("twitterPreviewInnerDisplay")[0];
    console.log(headtwitterPreview)
    $( "#twitterPreviewScript" ).remove()
    $( ".twitter-timeline" ).remove()
 
    var a= document.createElement('a');
    a.classList.add("twitter-timeline");
    a.href="https://twitter.com/"+handle;
    headtwitterPreview.appendChild(a)
    var script= document.createElement('script');
    script.id="twitterPreviewScript";
    script.src = "https://platform.twitter.com/widgets.js";
    script.charset="utf-8";
    headtwitterPreview.appendChild(script)
 });


function showTwitterPage(e){
    document.getElementsByClassName("twitterButtonContainerOff")[0].classList.add("hidden")
    document.getElementsByClassName("discordButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("nitroButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("discordButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("nitroButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("twitterButtonContainerOn")[0].classList.remove("hidden")
    document.getElementsByClassName("settingsButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("settingsButtonContainerOff")[0].classList.remove("hidden")

    document.getElementsByClassName("twitterPage")[0].classList.remove('hidden')
    document.getElementsByClassName("discordPage")[0].classList.add('hidden')
    document.getElementsByClassName("nitroPage")[0].classList.add('hidden')
    document.getElementsByClassName("settingsPage")[0].classList.add('hidden')
    
}


function showDiscordPage(e){
    document.getElementsByClassName("discordButtonContainerOff")[0].classList.add("hidden")
    document.getElementsByClassName("twitterButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("nitroButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("twitterButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("nitroButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("discordButtonContainerOn")[0].classList.remove("hidden")
    document.getElementsByClassName("settingsButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("settingsButtonContainerOff")[0].classList.remove("hidden")


    document.getElementsByClassName("twitterPage")[0].classList.add('hidden')
    document.getElementsByClassName("discordPage")[0].classList.remove('hidden')
    document.getElementsByClassName("nitroPage")[0].classList.add('hidden')
    document.getElementsByClassName("settingsPage")[0].classList.add('hidden')

}

function showNitroPage(e){
    document.getElementsByClassName("nitroButtonContainerOff")[0].classList.add("hidden")
    document.getElementsByClassName("twitterButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("discordButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("twitterButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("nitroButtonContainerOn")[0].classList.remove("hidden")
    document.getElementsByClassName("discordButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("settingsButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("settingsButtonContainerOff")[0].classList.remove("hidden")


    document.getElementsByClassName("twitterPage")[0].classList.add('hidden')
    document.getElementsByClassName("discordPage")[0].classList.add('hidden')
    document.getElementsByClassName("settingsPage")[0].classList.add('hidden')
    document.getElementsByClassName("nitroPage")[0].classList.remove('hidden')
}



function showSettingsPage(e){
    document.getElementsByClassName("nitroButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("twitterButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("discordButtonContainerOff")[0].classList.remove("hidden")
    document.getElementsByClassName("twitterButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("nitroButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("discordButtonContainerOn")[0].classList.add("hidden")
    document.getElementsByClassName("settingsButtonContainerOn")[0].classList.remove("hidden")
    document.getElementsByClassName("settingsButtonContainerOff")[0].classList.add("hidden")



    document.getElementsByClassName("twitterPage")[0].classList.add('hidden')
    document.getElementsByClassName("discordPage")[0].classList.add('hidden')
    document.getElementsByClassName("nitroPage")[0].classList.add('hidden')
    document.getElementsByClassName("settingsPage")[0].classList.remove('hidden')
}











function openAccountLink(e){
    var link = e.innerText.substring(1)

    shell.openExternal("https://twitter.com/"+link);
}


function openNormalLink(e){
    var link = e.innerText
    shell.openExternal(link);
}

function copyToClip(e){
    ipcRenderer.send("copy:text",e.innerText)
}







function deleteAccount(e){
    //console.log(e)




    var accountsTable = document.getElementsByClassName("accountsTable")[0].getElementsByTagName('tbody')[0];
    var i = e.parentNode.parentNode.rowIndex;
    //console.log(i)
    accountsTable.deleteRow(i)

    var backgroundTable = document.getElementsByClassName("accountsTableBehind")[0].getElementsByTagName('tbody')[0];
    var lightTable = document.getElementsByClassName("accountsTableLight")[0].getElementsByTagName('tbody')[0];
    var darkTable = document.getElementsByClassName("accountsTableDark")[0].getElementsByTagName('tbody')[0];
    backgroundTable.deleteRow(i)
    lightTable.deleteRow(i)
    darkTable.deleteRow(i)

    
    //checks to see if task already started
    
    currentRow = e.parentNode.parentNode
    //console.log(currentRow)
    var handle = currentRow.querySelector('p').innerText.substring(1);
    
    var toggle = currentRow.querySelector('input')
    if(toggle.checked) {
        ipcRenderer.send('stop:twitter',handle)
    } else {
        console.log('already stopped')
    }
    

}



ipcRenderer.on('new:accountRow', function(e, pfpLink, handle){
    var accountsTable = document.getElementsByClassName("accountsTable")[0].getElementsByTagName('tbody')[0];
    var tr = document.createElement('tr');

    tr.classList.add('accountRowBackground')
    
    var profileCell = tr.insertCell();
    var img = document.createElement('img');
    img.classList.add('twitterImage');
    img.src=pfpLink;
    profileCell.appendChild(img)



    var usernameCell = tr.insertCell();

    var p = document.createElement('p');
    p.innerText='@' + handle;
    var a = document.createElement('a');
    a.classList.add('twitterLink');
    a.onclick = function() {openAccountLink(this)};
    a.appendChild(p)
    usernameCell.appendChild(a);


    var switchCell = tr.insertCell();
    var label = document.createElement('label');
    label.classList.add("switch")
    label.classList.add("accountSwitch")
    var input = document.createElement('input');
    input.type = "checkbox"
    input.name = "accountSwitch"
    input.onclick = function() {twitterToggle(this)}
    var span = document.createElement('span')
    span.classList.add('slider')
    span.classList.add('round')
    label.appendChild(input)
    label.appendChild(span)
    switchCell.appendChild(label)

    var deleteCell = tr.insertCell();
    var button = document.createElement('button');
    var img1 = document.createElement('img');
    button.classList.add('deleteAccount');
    img1.src="images/Close-2.png";
    button.appendChild(img1)
    button.onclick = function() {deleteAccount(this)};
    deleteCell.appendChild(button)


    accountsTable.appendChild(tr)





    var backgroundTable = document.getElementsByClassName("accountsTableBehind")[0].getElementsByTagName('tbody')[0];
    
    var tr = document.createElement('tr');
    tr.classList.add('accountRowBehind')
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    backgroundTable.appendChild(tr)


    var lightTable = document.getElementsByClassName("accountsTableLight")[0].getElementsByTagName('tbody')[0];
    
    var tr = document.createElement('tr');
    tr.classList.add('accountRowLight')
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    lightTable.appendChild(tr)


    var darkTable = document.getElementsByClassName("accountsTableDark")[0].getElementsByTagName('tbody')[0];
    
    var tr = document.createElement('tr');
    tr.classList.add('accountRowDark')
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    darkTable.appendChild(tr)


    

})





function startAllTwitter(e){
    console.log('started')
}





ipcRenderer.on('new:tweet', function(e, pfpLink, handle, twitterName, timestampDate,timestampTime, message, tweetImage,recievedStamp, detectedPass, detectedLink){

    var tweetsTable = document.getElementsByClassName("tweetTable")[0].getElementsByTagName('tbody')[0];
    var tr  = tweetsTable.insertRow(0);

    tr.classList.add('tweetRowBackground')


    
    /*--------------First Cell----------------*/

    var infoCell = tr.insertCell();

    var infoDiv = document.createElement('div');
    infoDiv.classList.add('tweetInfoCellContainer');
    var userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('tweetUserInfo');
    
    var pfpimg = document.createElement('img');
    pfpimg.classList.add('twitterImage');
    pfpimg.src = pfpLink;
    userInfoDiv.appendChild(pfpimg)

    var innerInfoDiv = document.createElement('div');
    var displayName = document.createElement('p');
    displayName.innerText = twitterName
    displayName.id = "shownUsername"
    innerInfoDiv.appendChild(displayName)
    var shownHandle = document.createElement('p');
    shownHandle.innerText='@' + handle;
    var accountLink = document.createElement('a');
    accountLink.classList.add('twitterLink');
    accountLink.onclick = function() {openAccountLink(this)};
    accountLink.appendChild(shownHandle)
    innerInfoDiv.appendChild(accountLink);
    userInfoDiv.appendChild(innerInfoDiv)

    var timestampDiv = document.createElement('div');

    timestampDiv.classList.add('tweetTimestampContainer');
    var timestamp = document.createElement('p');
    timestamp.id = "tweetStamp"
    timestamp.innerText = recievedStamp
    timestampDiv.appendChild(timestamp)
    var firstTime = document.createElement('p')
    firstTime.innerText = timestampTime
    timestampDiv.appendChild(firstTime)
    var secondTime = document.createElement('p')
    secondTime.innerText = timestampDate
    timestampDiv.appendChild(secondTime)
    
    infoDiv.appendChild(userInfoDiv)
    infoDiv.appendChild(timestampDiv)
    infoCell.appendChild(infoDiv)

    /*-----------------------------------------*/





    /*----------------Second Cell-----------------*/


    var messageCell = tr.insertCell();

    var messageText = document.createElement('p');
    messageText.classList.add('tweetMessage')
    messageText.innerText = message;
    messageCell.appendChild(messageText)

    if(tweetImage != undefined){
        var messageImage = document.createElement('img');
        messageImage.classList.add('tweetImage');
        messageImage.src = tweetImage
        messageCell.appendChild(messageImage)
    }

    /*-----------------------------------------*/




    /*----------------Third Cell-----------------*/


    var detectedCell = tr.insertCell();

    var detectedDiv = document.createElement('div');
    detectedDiv.classList.add('detectedTweet')

    var passTitle = document.createElement('h5')
    passTitle.innerText = 'Detected Passwords:'
    detectedDiv.appendChild(passTitle)
    var pass = document.createElement('p');
    if(detectedPass != undefined){
        pass.innerText = detectedPass;
    }else{
        pass.innerText = 'NONE';
    }
    detectedDiv.appendChild(pass)
    
    var linkTitle = document.createElement('h5')
    linkTitle.innerText = 'Detected Links:'
    detectedDiv.appendChild(linkTitle)
    if(detectedLink != undefined){
        var link = document.createElement('p');
        var linkWrap = document.createElement('a');
        linkWrap.classList.add('detectedLink')
        linkWrap.onclick = function() {openNormalLink(this)};
        link = detectedLink
        linkWrap.appendChild(link)
        detectedDiv.appendChild(linkWrap)
    }else{
        var link = document.createElement('p');
        link.innerText = 'NONE';
        detectedDiv.appendChild(link)
    }
    detectedCell.appendChild(detectedDiv)
    /*-----------------------------------------*/




    //tweetsTable.appendChild(tr)






})
















function closeWindow(e){
    ipcRenderer.send('close')
}
function miniWindow(e){
    ipcRenderer.send('minimize')
}

const settingsPage = document.querySelector(".settings")
/*
const toggleProxyGroupsButton = document.querySelector('.toggleProxyBox');
toggleProxyGroupsButton.addEventListener('click', toggleProxyGroups); 


function openSettings(e){
    console.log("settings");
    settingsPage.classList.remove('hidden');
}
*/






function addAccount(e){
    var allContent = document.getElementsByClassName("content")[0];
    allContent.classList.add("blur");
    document.getElementsByClassName("lotusBackground")[0].classList.add('blur');
    var backgroundBlock = document.getElementsByClassName('popupAddAccountBackground')[0];
    backgroundBlock.classList.remove('hidden');

    var popup = document.getElementsByClassName('popupAddAccount')[0];
    popup.classList.add('active');
}



function closePopup(e){
    var allContent = document.getElementsByClassName("content")[0];
    allContent.classList.remove("blur");
    document.getElementsByClassName("lotusBackground")[0].classList.remove('blur');
 
    var backgroundBlock = document.getElementsByClassName('popupAddAccountBackground')[0];
    backgroundBlock.classList.add('hidden');

    
    var popup = document.getElementsByClassName('popupAddAccount')[0];
    popup.classList.remove('active');
}




function addChannel(e){
    var allContent = document.getElementsByClassName("content")[0];
    allContent.classList.add("blur");
    document.getElementsByClassName("lotusBackground")[0].classList.add('blur');
    var backgroundBlock = document.getElementsByClassName('popupAddChannelBackground')[0];
    backgroundBlock.classList.remove('hidden');

    var popup = document.getElementsByClassName('popupAddChannel')[0];
    popup.classList.add('active');
}



function closeChannelPopup(e){
    var allContent = document.getElementsByClassName("content")[0];
    allContent.classList.remove("blur");
    document.getElementsByClassName("lotusBackground")[0].classList.remove('blur');
 
    var backgroundBlock = document.getElementsByClassName('popupAddChannelBackground')[0];
    backgroundBlock.classList.add('hidden');

    
    var popup = document.getElementsByClassName('popupAddChannel')[0];
    popup.classList.remove('active');
}










function proccessAccount(e){
    handle = document.getElementsByClassName("accountInputBox")[0].value

    accountsTable = document.getElementsByClassName("accountsTable")[0]
    /*
    var tr = document.createElement('tr');
    
    var profileCell = tr.insertCell()
    */

    ipcRenderer.send('newAccount',handle)
    document.getElementsByClassName("accountInputBox")[0].value = ""
    $( "#twitterPreviewScript" ).remove()
    $( ".twitter-timeline" ).remove()
}








var checkboxAll = document.querySelector("input[name=monitorAll]");

checkboxAll.addEventListener( 'change', function() {
    if(this.checked) {

        //var accountSwitches = document.querySelectorAll("input[name=accountSwitch]")

        var accountSwitches = document.getElementsByClassName("accountRowBackground")
        


        

        for (var i=0; i < accountSwitches.length; i++) {
            if(accountSwitches[i].querySelectorAll("input[name=accountSwitch]")[0].checked == false){
                ipcRenderer.send('start:twitter',accountSwitches[i].querySelectorAll("p")[0].innerText.substring(1))
            }
            accountSwitches[i].querySelectorAll("input[name=accountSwitch]")[0].checked = true
          }
    } else {
        ipcRenderer.send('clearAll:twitter')
        var accountSwitches = document.querySelectorAll("input[name=accountSwitch]")
        for (var i=0; i < accountSwitches.length; i++) {
            accountSwitches[i].checked = false
          }
    }
});



var checkboxChannelAll = document.querySelector("input[name=monitorAllChannels]");

checkboxChannelAll.addEventListener( 'change', function() {
    if(this.checked) {

        

        var channelSwitches = document.getElementsByClassName("channelRowBackground")
        


        

        for (var i=0; i < channelSwitches.length; i++) {
            if(channelSwitches[i].querySelectorAll("input[name=channelSwitch]")[0].checked == false){
                ipcRenderer.send('add:channel',channelSwitches[i].querySelectorAll("p")[0].innerText)
            }
            channelSwitches[i].querySelectorAll("input[name=channelSwitch]")[0].checked = true
          }
    } else {
        ipcRenderer.send('clear:channel')
        var channelSwitches = document.querySelectorAll("input[name=channelSwitch]")
        for (var i=0; i < channelSwitches.length; i++) {
            channelSwitches[i].checked = false
          }
    }
});





function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a onclick="openNormalLink(this)"><p class="inTextLink">' + url + '</p></a>';

    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}






function twitterToggle(e){
    currentRow = e.parentNode.parentNode.parentNode
    var handle = currentRow.querySelector('p').innerText.substring(1);
    if(e.checked) {
        //console.log('start ' + handle)
        ipcRenderer.send('start:twitter',handle)
    } else {
        ipcRenderer.send('stop:twitter',handle)
        //console.log('stop ' + handle)
    }
}



//add account popupfunctions
var accountInput = document.getElementsByClassName("accountInputBox")[0];
accountInput.addEventListener("keyup",function(e){
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        e.preventDefault();
        // Trigger the button element with a click
        proccessAccount(e)
      }
})

var accountInputBackground = document.getElementsByClassName("popupAddAccountBackground")[0];
accountInputBackground.addEventListener("click",function(e){
    closePopup()
})


document.getElementById("autoSolveMathInput").disabled = true;


var channelInputBackground = document.getElementsByClassName("popupAddChannelBackground")[0];
channelInputBackground.addEventListener("click",function(e){
    closeChannelPopup()
})

function testWebhook(){
    var urlHook = $(".webhookInputBox")[0].value
}

$("#saveSettingsSubmit").on('click', function(){
    console.log('save')
    var settings = {}
    settings.urlHook = $(".webhookInputBox")[0].value
    settings.monitorToken = $(".monitorTokenInputBox")[0].value
    var claimers = $(".claimerTokenInputBox")
    settings.claimerTokens = []
    for (var i = 0; i < claimers.length; i++) {
        let token = $(".claimerTokenInputBox")[i].value
        if(token.length> 0){
            settings.claimerTokens.push(token)
        }
    }

    settings.passwordCopy = $(".linkSettingsOnSwitch")[0].children[0].checked
    settings.solveMath = $(".linkSettingsOnSwitch")[1].children[0].checked
    settings.openLinks = $(".linkSettingsOnSwitch")[2].children[0].checked
    settings.appendLinkPass = $(".linkSettingsOnSwitch")[3].children[0].checked
    settings.joinDiscords = $(".linkSettingsOnSwitch")[4].children[0].checked
    console.log(settings)
    ipcRenderer.send('save:settings', settings)
})

ipcRenderer.on('load:settings', function(e, settings){
    document.getElementsByClassName("webhookInputBox")[0].value = settings.urlHook

    document.getElementsByClassName("monitorTokenInputBox")[0].value = settings.monitorToken
    if(settings.claimerTokens[0] != undefined){
        document.getElementsByClassName("claimerTokenInputBox")[0].value = settings.claimerTokens[0]
    }
    if(settings.claimerTokens[1] != undefined){
        document.getElementsByClassName("claimerTokenInputBox")[1].value = settings.claimerTokens[1]
    }
    if(settings.claimerTokens[2] != undefined){
        document.getElementsByClassName("claimerTokenInputBox")[2].value = settings.claimerTokens[2]
    }

    document.getElementsByClassName("linkSettingsOnSwitch")[0].children[0].checked = settings.passwordCopy
    document.getElementsByClassName("linkSettingsOnSwitch")[1].children[0].checked = settings.solveMath
    document.getElementsByClassName("linkSettingsOnSwitch")[2].children[0].checked = settings.openLinks
    document.getElementsByClassName("linkSettingsOnSwitch")[3].children[0].checked = settings.appendLinkPass
    document.getElementsByClassName("linkSettingsOnSwitch")[4].children[0].checked = settings.joinDiscords

})
//document.getElementsByClassName("webhookInputBox")[0].value = 'dfdgsf'



//add channel popupfunctions
var accountInput = document.getElementsByClassName("channelInputBox")[0];
accountInput.addEventListener("keyup",function(e){
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        e.preventDefault();
        // Trigger the button element with a click
        processChannel(e)
      }
})


function processChannel(){
    createNewChannelRow(document.getElementsByClassName("channelInputBox")[0].value)
    document.getElementsByClassName("channelInputBox")[0].value = ''
}

function createNewChannelRow(channelID){
    var channelsTable = document.getElementsByClassName("channelsTable")[0].getElementsByTagName('tbody')[0];
    var tr = document.createElement('tr');

    tr.classList.add('channelRowBackground')
    


    var channelCell = tr.insertCell();

    var p = document.createElement('p');
    p.innerText= channelID;

    channelCell.appendChild(p);


    var switchCell = tr.insertCell();
    var label = document.createElement('label');
    label.classList.add("switch")
    label.classList.add("channelSwitch")
    var input = document.createElement('input');
    input.type = "checkbox"
    input.name = "channelSwitch"
    input.onclick = function() {discordToggle(this)}
    var span = document.createElement('span')
    span.classList.add('slider')
    span.classList.add('round')
    label.appendChild(input)
    label.appendChild(span)
    switchCell.appendChild(label)

    var deleteCell = tr.insertCell();
    var button = document.createElement('button');
    var img1 = document.createElement('img');
    button.classList.add('deleteChannel');
    img1.src="images/Close-2.png";
    button.appendChild(img1)
    button.onclick = function() {deleteChannel(this)};
    deleteCell.appendChild(button)


    channelsTable.appendChild(tr)





    var backgroundTable = document.getElementsByClassName("channelsTableBehind")[0].getElementsByTagName('tbody')[0];
    
    var tr = document.createElement('tr');
    tr.classList.add('channelRowBehind')
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    backgroundTable.appendChild(tr)


    var lightTable = document.getElementsByClassName("channelsTableLight")[0].getElementsByTagName('tbody')[0];
    
    var tr = document.createElement('tr');
    tr.classList.add('channelRowLight')
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    lightTable.appendChild(tr)


    var darkTable = document.getElementsByClassName("channelsTableDark")[0].getElementsByTagName('tbody')[0];
    
    var tr = document.createElement('tr');
    tr.classList.add('channelRowDark')
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    tr.insertCell()
    darkTable.appendChild(tr)





}










function deleteChannel(e){
    //console.log(e)




    var channelsTable = document.getElementsByClassName("channelsTable")[0].getElementsByTagName('tbody')[0];
    var i = e.parentNode.parentNode.rowIndex;
    //console.log(i)
    channelsTable.deleteRow(i)

    var backgroundTable = document.getElementsByClassName("channelsTableBehind")[0].getElementsByTagName('tbody')[0];
    var lightTable = document.getElementsByClassName("channelsTableLight")[0].getElementsByTagName('tbody')[0];
    var darkTable = document.getElementsByClassName("channelsTableDark")[0].getElementsByTagName('tbody')[0];
    backgroundTable.deleteRow(i)
    lightTable.deleteRow(i)
    darkTable.deleteRow(i)

    
    //checks to see if task already started
    
    currentRow = e.parentNode.parentNode
    //console.log(currentRow)
    var channel = currentRow.querySelector('p').innerText;
    
    var toggle = currentRow.querySelector('input')
    if(toggle.checked) {
        ipcRenderer.send('remove:channel',channel)
    }

}


function discordToggle(e){
    currentRow = e.parentNode.parentNode.parentNode
    var channel = currentRow.querySelector('p').innerText;
    if(e.checked) {
        //console.log('start ' + handle)
        ipcRenderer.send('add:channel',channel)
    } else {
        ipcRenderer.send('remove:channel',channel)
        //console.log('stop ' + handle)
    }
}


var keywordInput = document.getElementsByClassName("keywordsInputBox")[0]

keywordInput.addEventListener("keyup",function(e){
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        e.preventDefault();
        // Trigger the button element with a click
        processKeyword(e)
      }
})


function processKeyword(e){
    keyword = document.getElementsByClassName("keywordsInputBox")[0].value
    document.getElementsByClassName("keywordsInputBox")[0].value = ''
    if(keyword != ''){
        keyword = keyword.toLowerCase().trim()
        if(keyword.charAt(0) == "+"){
            ipcRenderer.send('add:positiveKeyword',keyword.substring(1))
            addPositiveKeyword(keyword.substring(1))
        }else if(keyword.charAt(0) == "-"){
            ipcRenderer.send('add:negativeKeyword',keyword.substring(1))
            addNegativeKeyword(keyword.substring(1))
        }else{
            ipcRenderer.send('add:positiveKeyword',keyword)
            addPositiveKeyword(keyword)

        }
    }
}


function addPositiveKeyword(keyword){
    var keywordGrid = document.getElementsByClassName("keywordsGrid")[0]
    var mainDiv = document.createElement('div')
    mainDiv.classList.add('keyword-item')
    mainDiv.id = 'positiveKeyword'

    var p = document.createElement('p')
    p.id = "positiveKeywordText"
    p.innerText = keyword
    mainDiv.appendChild(p)

    var button = document.createElement('button')
    button.classList.add("deleteKeyword")
    button.onclick = function() {deleteKeyword(this)}

    var img = document.createElement('img');
    img.src = 'images/colose 2 dark.png'
    button.appendChild(img)

    mainDiv.appendChild(button)
    keywordGrid.appendChild(mainDiv)
}

function addNegativeKeyword(keyword){
    var keywordGrid = document.getElementsByClassName("keywordsGrid")[0]
    var mainDiv = document.createElement('div')
    mainDiv.classList.add('keyword-item')
    mainDiv.id = 'negativeKeyword'

    var p = document.createElement('p')
    p.id = "negativeKeywordText"
    p.innerText = keyword
    mainDiv.appendChild(p)

    var button = document.createElement('button')
    button.classList.add("deleteKeyword")
    button.onclick = function() {deleteKeyword(this)}

    var img = document.createElement('img');
    img.src = 'images/close 2 light grey.png'
    button.appendChild(img)
    
    mainDiv.appendChild(button)
    keywordGrid.appendChild(mainDiv)
}

function deleteKeyword(e){
    if(e.parentNode.id == 'positiveKeyword'){
        ipcRenderer.send('remove:positiveKeyword',e.parentNode.children[0].innerText)
        e.parentNode.remove()
    }else{
        ipcRenderer.send('remove:negativeKeyword',e.parentNode.children[0].innerText)
        e.parentNode.remove()


    }
}






function startDiscordToggle(e){
    if(e.checked) {
        //console.log('start ' + handle)
        ipcRenderer.send('start:discordMonitoring')
    } else {
        ipcRenderer.send('stop:discordMonitoring')

    }
}




ipcRenderer.on('new:discordMessage', function(e, messageInfo){

    var messagesTable = document.getElementsByClassName("messageTable")[0].getElementsByTagName('tbody')[0];
    var tr  = messagesTable.insertRow(0);

    tr.classList.add('messageRowBackground')


    
    /*--------------First Cell----------------*/

    var infoCell = tr.insertCell();

    var infoDiv = document.createElement('div');
    infoDiv.classList.add('messageInfoCellContainer');
    var userInfoDiv = document.createElement('div');
    userInfoDiv.classList.add('messageUserInfo');
    
    var pfpimg = document.createElement('img');
    pfpimg.classList.add('Image');
    pfpimg.src = messageInfo.userPfp;
    userInfoDiv.appendChild(pfpimg)

    var innerInfoDiv = document.createElement('div');
    var displayName = document.createElement('p');
    displayName.innerText = messageInfo.name
    displayName.id = "shownUsername"
    innerInfoDiv.appendChild(displayName)
    var shownName = document.createElement('p');
    shownName.innerText=messageInfo.username;

    innerInfoDiv.appendChild(shownName);
    userInfoDiv.appendChild(innerInfoDiv)

    
    infoDiv.appendChild(userInfoDiv)
    infoCell.appendChild(infoDiv)

    /*-----------------------------------------*/





    /*----------------Second Cell-----------------*/


    var messageCell = tr.insertCell();

    var messageText = document.createElement('p');
    messageText.classList.add('messageMessage')
    messageText.innerHTML = urlify(messageInfo.content);
    messageCell.appendChild(messageText)



    /*-----------------------------------------*/




    /*----------------Third Cell-----------------*/


    var detectedCell = tr.insertCell();

    var detectedDiv = document.createElement('div');
    var passDiv = document.createElement('div');
    detectedDiv.classList.add('detectedMessage')

    var passTitle = document.createElement('h5')
    passTitle.innerText = 'Detected Passwords:'
    passDiv.appendChild(passTitle)
    var pass = document.createElement('p');
    if(messageInfo.pass != undefined){
        pass.innerText = messageInfo.pass;
        pass.id = "clickableWord"
        pass.onclick = function() {copyToClip(this)};
        passDiv.appendChild(pass)

    }else{
        pass.innerText = 'NONE';
        passDiv.appendChild(pass)
    }
    
    detectedDiv.appendChild(passDiv)
    
    var linkDiv = document.createElement('div');
    var linkTitle = document.createElement('h5')
    linkTitle.innerText = 'Detected Links:'
    linkDiv.appendChild(linkTitle)
    if(messageInfo.links != undefined){
        for (i = 0; i < messageInfo.links.length; i++) {
            var link = document.createElement('p');
            var linkWrap = document.createElement('a');
            linkWrap.classList.add('detectedLink')
            linkWrap.onclick = function() {openNormalLink(this)};
            link.innerHTML = messageInfo.links[i]
            linkWrap.appendChild(link)
            linkDiv.appendChild(linkWrap)
          }
    }else{
        var link = document.createElement('p');
        link.innerText = 'NONE';
        linkDiv.appendChild(link)
    }
    detectedDiv.appendChild(linkDiv)

    detectedCell.appendChild(detectedDiv)
    /*-----------------------------------------*/




    //tweetsTable.appendChild(tr)






})


function clearMessageTable(){
    $('.messageRowBackground').remove()
}