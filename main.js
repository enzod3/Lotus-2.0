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
var isWin = process.platform === "win32";

//const bodyParser = require('body-parser');

const {app, BrowserWindow, Menu, ipcMain, remote} = electron;

let authWindow;

var urlhook = "https://discordapp.com/api/webhooks/712410129177509938/J2oBzDaIyEC5YRbv0wbZLJvQyJeECHq-46uuCMSHZKciKFdAYaUaswH0kMG9v4kqTFp5"

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
        //transparent: true, 
        resizable: true
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
    mainWindow()
    
    /*
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        ip = add
      })
    */
   /*
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
    */
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


ipcMain.on('newKey',function(e, key){
    console.log(key)
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
                console.log(($(".w-mediaonebox")).find('img')[0].attribs.src)
                
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
    instances[handle].ready = false
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
        instances[handle].ready = true

        instances[handle].info  = setInterval(() =>{
            
            if(instances[handle].ready == true){
                instances[handle].ready = false
                axios.get(url, mainOptions)
                    .then((response) => {
                        var json = response.data[0]
                        var newID = json.id_str
                        //console.log(newID)
                        if(instances[handle].oldIDs.includes(newID)== false){
                                console.log(newID)
                                instances[handle].oldIDs.push(newID)
                                var tweetInfo = {}
                                tweetInfo.message =  json.full_text
                                tweetInfo.pfpLink =  json.user.profile_image_url
                                tweetInfo.username =  json.user.screen_name
                                tweetInfo.displayName = json.user.name
                                tweetInfo.id = json.id_str
                                tweetInfo.img = undefined

                                
                                if(json.entities.media != undefined){
                                    tweetInfo.img = json.entities.media[0].media_url
                                }
                                tweetInfo.receivedStamp = new Date().toISOString(); 
                                //tweetInfo.receivedStamp = tweetInfo.receivedStamp.
                                tweetInfo.timestamp = snowflakeToTimestamp(json.id_str)
                                //instances[handle].timestamp = new Date().getTime(); 
                                sendWebhook(tweetInfo)
                                sendTweet(tweetInfo)
                                //console.log(tweetInfo.img)
                                
                        }
                        instances[handle].ready = true

                    })
                    .catch((error) => {
                        instances[handle].ready = true
                            if(error.response == undefined){
                                console.log('Timeout Breached: ' + handle)
                                //console.log(error)
                            }else{
                                console.log(error.response.status)
                            }
                        })

                
            }

    
            },10)



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


function sendTweet(tweetInfo){
    console.log(tweetInfo)
    pfpLink = tweetInfo.pfpLink
    tweetInfo.timestamp = snowflakeToTimestamp(tweetInfo.id)
    var dateObject = new Date(parseFloat(tweetInfo.timestamp))
    var humanDateFormat = dateObject.toLocaleString("en-US", {timeZoneName: "short"})
    humanDateFormat = humanDateFormat.split(",");

    date = (humanDateFormat[1]).trim()
    time = (humanDateFormat[0]).trim()
    
    mainWindow.webContents.send('new:tweet', tweetInfo.pfpLink,tweetInfo.username,tweetInfo.displayName,date,time,tweetInfo.message,tweetInfo.img,tweetInfo.receivedStamp);

}










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
    
}




function startTwitter(handle){
    if(instances[handle]==undefined){
        startMonitorInstance(handle)
        console.log('Monitoring @'+handle )
    }else{
        console.log('already monitoring @ '+ handle )
    }

}



function stopMonitorInstance(handle){
    if(instances[handle] != undefined||instances[handle].info!=undefined){
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

}


ipcMain.on('stop:twitter', function(e, handle){
    stopMonitorInstance(handle)
    //console.log(handle)
})


function loadSettings(settings){
    mainWindow.webContents.send('load:settings',settings);
}

function saveSettings(settingsNew){
    settings = settingsNew
    console.log(settings)
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
    startDiscordMonitor(settings.monitorToken)
    startBot = true
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
                        contentArray.push(content )
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
                    messageInfo = {}
                    if(msg.author.avatar == null){messageInfo.userPfp = "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png"}
                    else{messageInfo.userPfp = `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}.webp?size=256`}
                    messageInfo.name = msg.author.username
                    messageInfo.username = msg.author.username+'#'+msg.author.discriminator
                    messageInfo.content = content

                    let possiblePass = getPassword(content)
                    if(possiblePass != ''){messageInfo.pass = possiblePass}
                    else{messageInfo.pass = undefined}

                    let possibleLinks = detectLinks(content)
                    if(possibleLinks != null){messageInfo.links = possibleLinks}
                    else{messageInfo.links = undefined}
                    console.log(messageInfo)
                    mainWindow.webContents.send('new:discordMessage',messageInfo)
                    if(settings.passwordCopy){
                        if(possiblePass != undefined){
                            copy(possiblePass)
                        }
                    }
                    if(settings.openLinks){
                        openLinks(content)
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








function openLinks(message){
    let re = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gm
    if(message.match(re) != null){
        for (index = 0; index < message.match(re).length; index++) { 
            var link = message.match(re)[index]
            if(oldLinks.length < 3){
                if(oldLinks.includes(link) == false){
                     opn(link); 
                     oldLinks.push(link)
                }
            }else{
                oldLinks.shift()
                if(oldLinks.includes(link)==false){
                    opn(link); 
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
    description = description.split(' ')
	var keywords = ['Password', 'Pass', 'Password Is', 'Password:', 'pass', 'password:', 'password is', 'PW', 'PW:', 'pW', 'Pw', 'pw', 'pw:', 'Password Below', 'Password=', 'password=', 'Password =', 'password =']
	for (let x of keywords) {
        for(let desItem of description){
            var fields = desItem.split(x);
            //console.log("Running For Password: "+fields)
            if (fields[1] != undefined) {
                var desIndex = description.indexOf(desItem)
                spacedpw = description[desIndex+1]
                console.log(description, desIndex)
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
}







function sendWebhook(type, status, message) {

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












