const electron = require('electron');
const url = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const axios = require('axios');
const request = require('request');
const fs = require('fs')
const os = require('os');
const storage = require('electron-json-storage');
const Eris = require("eris");
var opn = require('opn');
const console = require("console");
const fetch = require("node-fetch");
var opn = require('opn');
const clipboardy = require('clipboardy');
const { start } = require('repl');
const { settings } = require('cluster');
const { time } = require('console');
var isWin = process.platform === "win32";
const {machineId, machineIdSync} = require('node-machine-id');
//const bodyParser = require('body-parser');

const {app, BrowserWindow, Menu, ipcMain, remote} = electron;

let authWindow;

// Write

discordJoining = true

var ChannelLinks = [] // list of channel ID's for link opening
var PositiveKeywords = [] // List of positive keywords
var NegativeKeywords = [] // List of negative keywords
var oldLinks = []

var botInstanceLinks //Self-bot instance. 
var botInstanceNitros
var NegativeKeywordDetected = false // Global variable to declare whether negative keywords have been detected yet. Ignore this
var globalUsername // Username of user that is running
var server
var channel
var usersent


// You can obviously give a direct path without use the dialog (C:/Program Files/path/myfileexample.txt)

var twitterAccounts = [];

function mainWindow(){
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true},  
        width: 1440, 
        height: 900, 
        frame: false, 
        devTools: false,
        //transparent: true, 
        resizable: false
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'main.html'),
        protocol: 'file',
        slashes: true
    }));
    storage.get('settings', function(error, data) {
        if (error) throw error;
        if(Object.keys(data).length === 0){
            data = {
                urlHook: '',
                monitorToken: '',
                claimerTokens: [ ],
                passwordCopy: false,
                solveMath: false,
                openLinks: false,
                appendLinkPass: false,
                joinDiscords: false
              }   
              storage.set('settings', data)
              saveSettings(data)
              
        }else{
            saveSettings(data)
            setTimeout(function(){ loadSettings(data) },700)
        }
        
      });

}




app.on('ready', function(){
    //mainWindow()
    /*
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        ip = add
      })
    */
   
    authWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true},  
        width: 1132, 
        height: 684, 
        frame: false, 
        transparent: true, 
        resizable: false
    });

    authWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'auth.html'),
        protocol: 'file',
        slashes: true
    }));
    checkForToken()
    //const mainMenu = Menu.setApplicationMenu(null)
    
});



ipcMain.on('send:key', function(e,keyValue){
    //make get request here for key
    //console.log(keyValue);
    //const res = request('http://ftlvip.com/api/keys/P3M1K-3RTBI-GTLDG-ZKO1T-O9IZ4');
    request('http://ftlvip.com/api/keys/' + keyValue, function (error, response, body) {
        const status = response.statusCode
        if(response.statusCode == 200){
            let parsedJson = (JSON.parse(response.body));
            if(parsedJson["ip"]== "null" || parsedJson["ip"] == ip){
                //authWindow = ""
                mainWindow();
                authWindow.close();
                authWindow = "";
                console.log(status)
            }
            else{
                console.log('resetip')
                authWindow.webContents.send('key:reset');
            }
        }
        else{
            console.log('invalid')
            authWindow.webContents.send('key:invalid');
        }
        //console.log('body:', body); // Print the HTML for the Google homepage.
    });
});



function checkForToken(){
    storage.get('key', function(error, data) {
        if(data != {}){
            request({
                method: 'GET',
                uri: 'https://lotus.llc/api/v1/activations/'+data,
                headers: {'Authorization':'Bearer ak_WkJ_xxGcxT5AwKcRHZz1'},
                },
                function (err, response, body) {
                    if (err) {
                        console.log(err)
                    }
                    if(response.statusCode == 200){
                        storage.set('key',body.activation_token)
                        mainWindow()
                        authWindow.close()
                        authWindow = ""
                    }else{
                        storage.remove('key')
                        authWindow.webContents.send('key:reset');
                    }
                }
            )
        }
    })
}

ipcMain.on('newKey',function(e, key){
    console.log(key)
    if(key != "" && key.length == 23){
        let id = machineIdSync({original: true})
        var keyInfo = {
            "key": key,
            "activation": {
                "hwid": id,
                "device_name": os.hostname()
            }
        }
        console.log(keyInfo)
        request({
            method: 'POST',
            uri: 'https://lotus.llc/api/v1/activations',
            headers: {'Authorization':'Bearer ak_WkJ_xxGcxT5AwKcRHZz1'},
            json: keyInfo,
            },
            function (err, response, body) {
                if (err) {
                    console.log(err)
                }
                if(response.statusCode == 200){
                    storage.set('key',body.activation_token)
                    mainWindow()
                    authWindow.close()
                    authWindow = ""
                }else if(response.statusCode == 409){
                    authWindow.webContents.send('key:reset');
                }else{
                    authWindow.webContents.send('key:invalid');
                }
            }
        )
            
        
    }else{
        authWindow.webContents.send('key:invalid');
    }

})

var getClipboard = function(func) {
    exec('/usr/bin/xclip -o -selection clipboard', function(err, stdout, stderr) {
      if (err || stderr) return func(err || new Error(stderr));
      func(null, stdout);
    });
  };



function copy(message){
    clipboardy.writeSync(message)
}


ipcMain.on('copy:text', function(e,text){
    console.log("copied "+text)
    copy(text)
})



ipcMain.on('newAccount', function(e, handle){
    twitterAccounts.push(handle);
    options = {
        
        url: "https://twitter.com/"+handle,
        headers: {
            'User-agent':"Mozilla/5.0 (Windows; U; Windows NT 5.1; rv:1.7.3) Gecko/20040913 Firefox/0.10"
        }
    }
    request(options, function (err, res, body) {
        if(err){
           console.log('error');
        }
        else{
            const $ = cheerio.load(body);
            try{
                //console.log($('.avatar')[0].children[0].next.attribs.src)
                const pfpLink = $('.avatar')[0].children[0].next.attribs.src
                //console.log((($('dir-ltr')[3]).text()).replace(/\n/g, ' '))
                mainWindow.webContents.send('new:accountRow', pfpLink, handle);
                
            }catch(e){
                const pfpLink = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png'
                mainWindow.webContents.send('new:accountRow', pfpLink, handle);
            }
        }
    });
    /* add request to account that gets twitter image and username*/
});





ipcMain.on('auth-close', function(e){
    //make get request here for key
    authWindow.close()
});

ipcMain.on('auth-minimize', function(e){
    authWindow.minimize()
})

ipcMain.on('close', function(e){
    //make get request here for key
    mainWindow.close()
});

ipcMain.on('minimize', function(e){
    mainWindow.minimize()
})






async function getRES(url) {
    try {
        const data = await axios.get(url);
        return data;
    } catch (e){
        const data = 'error'
        return data;
    }
    
}

//const mainMenu = []






ipcMain.on('start:twitter', function(e, handle){
    axios.get('https://twitter.com/'+handle,{timeout: 10000})
        .then(function (response){
            startTwitter(handle)
            })
        .catch(function(error){
            console.log('invalid account')
        })
    //console.log(handle)
})


ipcMain.on('stop:twitter', function(e, handle){
    stopMonitorInstance(handle)
    //console.log(handle)
})


ipcMain.on('clearAll:twitter', function(e){
    clearAllInstances()
})






//------------twitterMonitor------



instances = []


function startMonitorInstance(handle){
    instances[handle] = []
    //firstTweet = getLatestTweet(await getHTML('https://twitter.com/' +firstHandle))
    //var oldTweet = firstTweet
    instances[handle].oldIDs = []
    instances[handle].newID = []
    mainOptions = {
        headers: {
            'User-agent':"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
            'Authorization':'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'
        },
        timeout:260
    }
    var url = "https://api.twitter.com/1.1/statuses/user_timeline.json?include_rts=0&tweet_mode=extended&count=1&screen_name="+handle
   
    axios.get(url, mainOptions)
    .then((response) => {
        //console.log(response.data)
        var json = response.data[0]
        var newID = json.id_str
        
        instances[handle].oldIDs.push(newID)

        instances[handle].info  = setInterval(() =>{
            
                axios.get(url, mainOptions)
                    .then((response) => {
                        var json = response.data[0]
                        var newID = json.id_str
                        //console.log(newID)
                        if(instances[handle].oldIDs.includes(newID)== false){
                            instances[handle].timestamp = new Date().getTime(); 
                            console.log((instances[handle].timestamp - snowflakeToTimestamp(newID)))
                            if((instances[handle].timestamp - snowflakeToTimestamp(newID)) < 20000){
                                console.log(newID)
                                instances[handle].oldIDs.push(newID)
                                var tweetInfo = {}
                                tweetInfo.message =  json.full_text
                                tweetInfo.pfpLink =  json.user.profile_image_url
                                tweetInfo.username =  json.user.screen_name
                                tweetInfo.displayName = json.user.name
                                tweetInfo.id = json.id_str
                                tweetInfo.img = undefined

                                let possibleLinks = []
                                
                                if(json.entities.urls != []){
                                    for(let twitterLinkContainer of json.entities.urls){
                                        possibleLinks.push(twitterLinkContainer.expanded_url)
                                    }
                                    tweetInfo.links = possibleLinks
                                }else{
                                    tweetInfo.links = undefined
                                }
                                

                                if(json.entities.media != undefined){
                                    tweetInfo.img = json.entities.media[0].media_url
                                }
                                tweetInfo.receivedStamp = new Date().toISOString(); 
                                //tweetInfo.receivedStamp = tweetInfo.receivedStamp.
                                tweetInfo.timestamp = snowflakeToTimestamp(json.id_str)
                                //instances[handle].timestamp = new Date().getTime(); 
                                //sendWebhook(tweetInfo)
                                sendTweet(tweetInfo)
                                //console.log(tweetInfo.img)
                            }else{
                                console.log('Old tweet')
                            }
                        }

                    })
                    .catch((error) => {
                            if(error.response == undefined){
                                if(error.status =='ECONNABORTED'){
                                    console.log('Timeout Breached: ' + handle)
                                }else{
                                    console.log(error)
                                }
                            }else{
                                console.log(error.response.status)
                            }
                        })

                
            

    
            },5*(global.accountAmount))



        // newTweet = getLatestTweet(await getHTML('https://twitter.com/' +handle))





        //if((await newTweet).message != (await oldTweet).message){
        //    oldTweet = newTweet
        //    console.log(newTweet)
        //}
        // 
        
    
    },0);

    //firstTweet(handle)
}

//console.log(snowflakeToTimestamp(1267991089564319744))
function snowflakeToTimestamp(tweetId) {
    return parseInt(tweetId / 2 ** 22) + 1288834974657;
}

var accountAmount = 1
function updateTotalAccounts(){
    global.handleListAmount = 0;
    for (var c in instances) {
        global.handleListAmount = global.handleListAmount+ 1;
    }
    global.accountAmount = global.handleListAmount
    //console.log(global.accountAmount)
}

/*
function sendWebhook(tweetInfo){
    var embedData = {
        "username": "Lotus Monitor",
        "avatar_url": tweetInfo.pfpLink,
        "embeds": [{
            "author": {
                "name": "@" + 'polarisAIO',
                "url": "https://twitter.com/"+'dnoyCAIO',
                "icon_url": tweetInfo.pfpLink
            },
            "color": "3407830",
            "fields": [
                {
                    "name": "Content",
                    "value": tweetInfo.message,
                    "inline": false
                }
            ],
            "footer":{
                "text": "LotusAIO"
            }
                
        }]
    }
    
    var options = {
        url: urlhook,
        json: embedData,
        headers: {
          'Content-type': 'application/json'
        }
      };
    
    request.post(options,
        (error, res, body) => {
          if (error) {
            console.error(error)
            return
          }
          console.log(`statusCode: ${res.statusCode}`)
        }
    )
    
}

*/
function sendTweet(tweetInfo){
    var settings = global.settings

    tweetInfo.pfpLink
    tweetInfo.timestamp = snowflakeToTimestamp(tweetInfo.id)
    var dateObject = new Date(parseFloat(tweetInfo.timestamp))
    var humanDateFormat = dateObject.toLocaleString("en-US", {timeZoneName: "short"})
    humanDateFormat = humanDateFormat.split(",");

    tweetInfo.date = (humanDateFormat[1]).trim()
    tweetInfo.time = (humanDateFormat[0]).trim()
    
    let possiblePass = getPassword(tweetInfo.message)
    if(possiblePass != undefined){tweetInfo.pass = possiblePass}
    else{tweetInfo.pass = undefined}


    if(settings.openLinks){
        tweetInfo.openLinks = true//openLinks(tweetInfo.message,possiblePass)
    }   
    console.log(tweetInfo)
    mainWindow.webContents.send('new:tweet', tweetInfo);
    if(settings.joinDiscords){
        discordJoiner(tweetInfo.message)
    }     
    if(settings.passwordCopy){
        if(possiblePass != undefined){
            copy(possiblePass)
        }
    }
  

}




ipcMain.on('open:twitterLinks', function(e, tweetWithLinks, password){
    openLinks(tweetWithLinks,password)
})






function clearAllInstances(){
    //var handleListLength = lengtha(
    let handleListLength = 0;
    for (var c in instances) {
        handleListLength = handleListLength + 1;
    }
    let strName
    for(strName in instances){
        stopMonitorInstance(strName)
    }
    updateTotalAccounts()
    
}




function startTwitter(handle){
    if(instances[handle]==undefined){
        startMonitorInstance(handle)
        console.log('Monitoring @'+handle )
    }else{
        console.log('already monitoring @ '+ handle )
    }
    updateTotalAccounts()
}



function stopMonitorInstance(handle){
    if(instances[handle] != undefined){
        console.log('Cleared @'+handle )
        clearInterval(instances[handle].info)
        instances[handle].oldIDs = []
        instances[handle].newID = []
        instances[handle]= ''
        var newInstances = []
        for(strName in instances){
            if(strName != handle){
                newInstances[strName] = instances[strName]
            }
        }
        instances = newInstances
    }
    //console.log(newInstances)
    updateTotalAccounts()

}


ipcMain.on('stop:twitter', function(e, handle){
    stopMonitorInstance(handle)
    //console.log(handle)
})


function loadSettings(settings){
    mainWindow.webContents.send('load:settings',settings);
}

function saveSettings(settingsNew){
    global.settings = settingsNew
    console.log(global.settings)
}




ipcMain.on('save:settings', function(e, settings){
    saveSettings(settings)
    storage.set('settings', settings)
})









ipcMain.on('clear:channel',function(e, channelId){
    ChannelLinks = []
})





ipcMain.on('remove:channel',function(e, channelId){
    const index = ChannelLinks.indexOf(channelId)
    if (index > -1) {
        ChannelLinks.splice(index, 1);
      }

})



ipcMain.on('add:channel',function(e, channelId){
    ChannelLinks.push(channelId)

})


ipcMain.on('add:positiveKeyword',function(e, keyword){
    PositiveKeywords.push(keyword)

})


ipcMain.on('add:negativeKeyword',function(e, keyword){
    NegativeKeywords.push(keyword)

})


ipcMain.on('remove:positiveKeyword',function(e, keyword){
    const index = PositiveKeywords.indexOf(keyword)
    if (index > -1) {
        PositiveKeywords.splice(index, 1);
      }

})


ipcMain.on('remove:negativeKeyword',function(e, keyword){
    const index = NegativeKeywords.indexOf(keyword)
    if (index > -1) {
        NegativeKeywords.splice(index, 1);
      }
})



ipcMain.on('start:discordMonitoring', function(e){
    startDiscordMonitor(global.settings.monitorToken)
})


function startDiscordMonitor(Token) {
    var bot = new Eris(Token);
    
	bot.on("messageCreate", (msg) => {
        channelID = msg.channel.id
        if(ChannelLinks.includes(channelID) || ChannelLinks.includes('all')){
            try {
                EmbedCheck = msg.embeds[0].title
                contentArray = []
                contentArray.push(msg.content)
                contentArray.push(msg.embeds[0].description)
                iterate = true
                fieldIndex = 0
                while (iterate == true) {
                    try {
                        var content = msg.embeds[0].fields[fieldIndex].value
                        contentArray.push(content + '\n')
                    } catch {
                        iterate = false
                    }
                    fieldIndex += 1
                }
                try {
                    contentArray.push(msg.embeds[0].url)
                } catch {
                    embedurl = undefined
                }
                var content = contentArray.join(' ');
            } catch (error) {
                content = msg.content
            }
            includesPositives = false
            for (i = 0; i < PositiveKeywords.length; i++) {
                if((content.toLowerCase()).includes(PositiveKeywords[i])){
                    includesPositives = true
                }
            }
            includesNegatives = false
            for (i = 0; i < NegativeKeywords.length; i++) {
                if((content.toLowerCase()).includes(NegativeKeywords[i])){
                    includesNegatives = true
                }
            }
            if(includesPositives || PositiveKeywords.length == 0){
                if(includesNegatives != true){
                    //mainDiscord()
                    var settings = global.settings
                    messageInfo = {}
                    if(msg.author.avatar == null){messageInfo.userPfp = "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"}
                    else{messageInfo.userPfp = `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.webp?size=256`}
                    messageInfo.name = msg.author.username
                    messageInfo.username = msg.author.username+'#'+msg.author.discriminator
                    console.log(msg)
                    try{
                        if(msg.member != null){
                            messageInfo.messageSource = "discord://discordapp.com/channels/"+msg.member.guild.id+"/"+msg.channel.id+"/"+msg.id
                        }else{
                            messageInfo.messageSource = "discord://discordapp.com/channels/@me/"+msg.channel.id+"/"+msg.id
                        }
                    }catch{
                        messageInfo.messageSource = ""
                    }

                    messageInfo.content = content

                    let possiblePass = getPassword(content)
                    if(possiblePass != undefined){messageInfo.pass = possiblePass}
                    else{messageInfo.pass = undefined}

                    let possibleLinks = detectLinks(content)
                    if(possibleLinks != null){messageInfo.links = possibleLinks}
                    else{messageInfo.links = undefined}
                    console.log(messageInfo)
                    mainWindow.webContents.send('new:discordMessage',messageInfo)
                    if(settings.joinDiscords){
                        discordJoiner(content)
                    }     
                    if(settings.passwordCopy){
                        if(possiblePass != undefined){
                            copy(possiblePass)
                        }
                    }
                    if(settings.openLinks){
                        openLinks(content,possiblePass)
                    }     
                }
        }
       }
	})
    botInstanceLinks = bot.connect()
    ipcMain.on('stop:discordMonitoring', function(e){
        try{stopMain()}catch(e){console.log(e)}
    })
    
    function stopMain() {
        bot.disconnect()
    }    
}




ipcMain.on('start:nitroMonitoring', function(e){
    startNitroMonitor(global.settings.monitorToken)
})



function startNitroMonitor(Token) {
    var settings = global.settings
    // Creates Bot Instance with token
    
	var botNitro = new Eris(Token);

	// Whenever a message is created, checks if message is in channel ID
	keys = ["discord.com/gifts/", "discord.gift/"] 
	botNitro.on("messageCreate", (msg) => {
        content = msg.content
		for (let x of keys) {
			if (content.includes(x)) {
                if(settings.claimerTokens != []){
                    claimToken = settings.claimerTokens[0]
                }else{
                    claimToken = settings.monitorToken
                }
				xx = content.split(x)
                var code = 'https://ptb.discordapp.com/api/v6/entitlements/gift-codes/' + xx[1] + "/redeem"
                var date = new Date();
                var firstStamp = date.getTime();
				fetch(code, {
					"headers": {
						"authorization": claimToken
					},
					"body": null,
					"method": "POST",
					"mode": "cors"
				}).then(body => {
                    nitroInfo = {}
                    var date = new Date();
                    var secondStamp = date.getTime();
                    nitroInfo.claimTime = secondStamp - firstStamp
                    if(msg.author.avatar == null){nitroInfo.userPfp = "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"}
                    else{nitroInfo.userPfp = `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.webp?size=256`}
                    nitroInfo.name = msg.author.username
                    nitroInfo.username = msg.author.username+'#'+msg.author.discriminator
                    try{
                        nitroInfo.server = msg.member.guild.name
                        nitroInfo.channel = msg.channel.name
                        if(msg.member.guild.icon != null){
                            nitroInfo.serverImgLink = "https://cdn.discordapp.com/icons/"+msg.member.guild.id+"/"+msg.member.guild.icon+".webp?size=256"
                        }else{
                            nitroInfo.serverImgLink = `https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png`
                        }
                    }catch{
                        nitroInfo.server = "DM"
                        nitroInfo.channel = "bruh in your dm"
                        nitroInfo.serverImgLink = `https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png`
                    }
                    try{
                        if(msg.member != null){
                            nitroInfo.messageSource = "discord://discordapp.com/channels/"+msg.member.guild.id+"/"+msg.channel.id+"/"+msg.id
                        }else{
                            nitroInfo.messageSource = "discord://discordapp.com/channels/@me/"+msg.channel.id+"/"+msg.id
                        }
                    }catch{
                        nitroInfo.messageSource = ""
                    }
                    console.log(body.status)
                    console.log(claimToken)
                    console.log(body)
                    if(body.status == 200){
                        nitroInfo.validNitro = true
                    }else{
                        nitroInfo.validNitro = false
                    }
                    nitroInfo.joinStatus = body.status


                    var dateObject = new Date(parseFloat(msg.timestamp))
                    var humanDateFormat = dateObject.toLocaleString("en-US", {timeZoneName: "short"})
                    humanDateFormat = humanDateFormat.split(",");
                
                    nitroInfo.time = (humanDateFormat[1]).trim()
                    nitroInfo.date = (humanDateFormat[0]).trim()
                    mainWindow.webContents.send('new:nitroMessage',nitroInfo)
                    /*
					joinStatus = body.status
					console.log(joinStatus)
					nitroMessage.server = msg.member.guild.name
					nitroMessage.channel = msg.channel.name
                    nitroMessage.usersent = msg.author.username
                    */
					//sendWebhook("Nitro Redeeming", joinStatus, code)

				})
			}
		}
    })
    botInstanceNitro = botNitro.connect()
    ipcMain.on('stop:nitroMonitoring', function(e){
        try{stopNitroMain()}catch(e){console.log(e)}
    })
    
    function stopNitroMain() {
        botNitro.disconnect()
    }   
}












function openLinks(message, possiblePass){
    var settings = global.settings
    let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm
    if(message.match(re) != null){
        for (index = 0; index < message.match(re).length; index++) { 
            var link = message.match(re)[index]
            if(oldLinks.length < 3){
                if(oldLinks.includes(link) == false){
                    if(settings.appendLinkPass){
                        if(possiblePass != undefined){
                            opn(link + possiblePass)
                        }else{
                            opn(link)
                        }
                    }else{
                        opn(link);
                    }
                    
                    oldLinks.push(link)
                }
            }else{
                oldLinks.shift()
                if(oldLinks.includes(link)==false){
                    if(settings.appendLinkPass){
                        if(possiblePass != undefined){
                            opn(link + possiblePass)
                        }else{
                            opn(link)
                        }
                    }else{
                        opn(link);
                    }
                    oldLinks.push(link)
                }
            }
        } 
    }

}





function detectLinks(message){
    let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm
    if(message.match(re) != null){
        return message.match(re)
    }else{
        return null
    }
}






function getPassword(description) {
    try{
        description = description.split(' ')
        var keywords = ['Password', 'Pass', 'Password Is', 'Password:', 'pass', 'password:', 'password is', 'PW', 'PW:', 'pW', 'Pw', 'pw', 'pw:', 'Password Below', 'Password=', 'password=', 'Password =', 'password =']
        for(let desItem of description){
            for (let x of keywords) {
                var fields = desItem.split(x);
                //console.log("Running For Password: "+fields)
                tripped = false
                if (fields[1] != undefined && tripped == false) {
                    tripped = true
                    var desIndex = description.indexOf(desItem)
                    spacedpw = description[desIndex+1]
                    /*
                    fields.shift()
                    var spacedpw = fields[0]
                    var spacedpw = spacedpw.split(/\n/g)
                    var spacedpw = spacedpw[0]
                    */
                    var unspacedpw = spacedpw.replace(/ /g, '')
                    var unspacedpw = unspacedpw.replace(":", '')
                    var unspacedpw = unspacedpw.replace("word", '')
                    var unspacedpw = unspacedpw.replace("pass", '')
                    var unspacedpw = unspacedpw.replace("is", '')
                    var unspacedpw = unspacedpw.replace("Is", '')
                    var unspacedpw = unspacedpw.replace("IS", '')
                    unspacedpw = unspacedpw.replace('?', '');
                    var unspacedpw = unspacedpw.replace("=", '')
                    var password = unspacedpw
                    return password
                    break
                }
            }
        }

    }catch(e){console.log(e) 
        return undefined}
}







function sendWebhook(type, status, message) {
    var settings = global.settings
	if (type == "Joined Discord") {

		const webhook = require("webhook-discord")
		//const Hook1 = new webhook.Webhook(successWebhook); // Our Webhook
		const Hook = new webhook.Webhook(settings.urlHook);
		const msg = new webhook.MessageBuilder()
			.setName("Lotus Invite Claimer")
			.setAvatar("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
			.setColor("#00FF00")
			.addField("Invite:", message)
			.addField("Reponse Code", status)
			.addField("Server", server)
			.addField("Channel", channel, inline = true)
			.addField("Invite Redeemed by:", "||" + globalUsername + "||", inline = true)
			.setThumbnail("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
			.setTitle("Redeemed Nitro!");

		Hook.send(msg);
		//Hook1.send(msg);


	}
	if (type == "Opened Link") {
		if (status == "openedFromDiscord") {

			const webhook = require("webhook-discord")
			//const Hook1 = new webhook.Webhook(successWebhook); // Our Webhook
			const Hook = new webhook.Webhook(settings.urlHook);
			const msg = new webhook.MessageBuilder()
				.setName("Lotus Link Opener")
				.setAvatar("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
				.setColor("#00FF00")
				.addField("Link:", message)
				.addField("Server", server)
				.addField("Channel", channel, inline = true)
				.addField("Link Opened By:", "||" + globalUsername + "||", inline = true)
				.setThumbnail("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
				.setTitle("Opened Link");

			Hook.send(msg);
			//Hook1.send(msg);
		}
		if (status == "openedFromTwitter") {

			const webhook = require("webhook-discord")
			//const Hook1 = new webhook.Webhook(successWebhook); // Our Webhook
			const Hook = new webhook.Webhook(settings.urlHook);
			const msg = new webhook.MessageBuilder()
				.setName("Lotus Link Opener")
				.setAvatar("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
				.setColor("#00FF00")
				.addField("Link:", message)
				.addField("Username", server)
				.addField("Link Opened By:", "||" + globalUsername + "||", inline = true)
				.setThumbnail(twitterProfilePic)
				.setTitle("Opened Link");

			Hook.send(msg);
			//Hook1.send(msg);


		}
	}
	if (type == "Nitro Redeemed") {
		const webhook = require("webhook-discord")
		//const Hook1 = new webhook.Webhook(successWebhook); // Our Webhook
		const Hook = new webhook.Webhook(settings.urlHook);
		const msg = new webhook.MessageBuilder()
			.setName("Lotus Nitro Claimer")
			.setAvatar("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
			.setColor("#00FF00")
			.addField("Gift:", message)
			.addField("Reponse Code", status)
			.addField("Server", server)
			.addField("Channel", channel, inline = true)
			.addField("Nitro Gifted:", "||" + usersent + "||", inline = true)
			.addField("Nitro Redeemed by:", "||" + globalUsername + "||", inline = true)
			.setThumbnail("https://media.discordapp.net/attachments/695675733187624960/723726324203520070/QPyR9T3m_400x400.png")
			.setTitle("Redeemed Nitro!");

		Hook.send(msg);
		//Hook1.send(msg);

	}

}












function discordJoiner(content, msg) {
    var settings = global.settings
	keys = ["discord.gg/", "Discord.gg/", "discord.com/invite/", "Discord.com/invite/"]
	contentLineSplit = content.split("\n")
	for (let x of keys) {
		for (let element of contentLineSplit) {
			element = element.split(" ")
			for (let xx of element) {
				if (xx.includes(x)) {
					xx = xx.split(x)
                    invite = 'https://discordapp.com/api/v6/invites/' + xx[1]
                    if(settings.claimerTokens != []){
                        for (let tokenInvites of settings.claimerTokens) {
                            fetch(invite, {
                                "headers": {
                                    "authorization": tokenInvites
                                },
                                "body": null,
                                "method": "POST",
                                "mode": "cors"
                            }).then(body => {
                                /*
                                joinStatus = body.status
                                console.log(joinStatus)
                                try {
                                    server = msg.member.guild.name
                                    channel = msg.channel.name
                                    usersent = msg.author.username
                                } catch {
                                    server = "N/A"
                                    channel = "N/A"
                                    usersent = msg.twitterUsername
                                }
                                sendWebhook("Joined Discord", joinStatus, invite)
                                */
                            })
                        }
                    }

				}
			}
		}
	}
}






