const electron = require('electron');
const url = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const axios = require('axios');
const request = require('request');
const fs = require('fs')
//const bodyParser = require('body-parser');

const {app, BrowserWindow, Menu, ipcMain, remote} = electron;


let authWindow;

var urlhook = "https://discordapp.com/api/webhooks/712410129177509938/J2oBzDaIyEC5YRbv0wbZLJvQyJeECHq-46uuCMSHZKciKFdAYaUaswH0kMG9v4kqTFp5"


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

}

app.on('ready', function(){
    mainWindow()
    
    /*
    require('dns').lookup(require('os').hostname(), function (err, add, fam) {
        ip = add
      })
    authWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true},  
        width: 550, 
        height: 340, 
        frame: false, 
        transparent: true, 
        resizable: false
    });

    authWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'auth.html'),
        protocol: 'file',
        slashes: true
    }));
    //const mainMenu = Menu.setApplicationMenu(null)
    */
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

startMonitorInstance('dnoycAIO')
function startMonitorInstance(handle){

    //firstTweet = getLatestTweet(await getHTML('https://twitter.com/' +firstHandle))
    //var oldTweet = firstTweet


    var options = {
        
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
        
        var $ = cheerio.load(body);
        /*
        if($('.js-pinned-text')[0] != undefined){
            instances[handle].pinned = 1
        }else{
            instances[handle].pinned = 0
        }
        */
            

        //console.log(body)
        //console.log(($('.dir-ltr')[3].children[0].data).replace(/\n/g, '').trim() )
        instances[handle].oldID = $('.tweet-text')[0].attribs['data-id']
        
        
        instances[handle].ready = true

        }
            
    })
    instances[handle] = setInterval(() =>{
        if(instances[handle].ready == true){
            instances[handle].ready = false
            var options = {
        
                url: "https://twitter.com/"+handle,
                headers: {
                    'User-agent':"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
                    'Authorization':''
                }
            }
            request(options, function (err, res, body) {
                if(err){
                    console.log(err)
                    instances[handle].ready = true
                }
                else{
                    //trys parse
                    try{
                        var $ = cheerio.load(body);
                        var tweetInfo = {}
                        tweetInfo.message =  ($('.dir-ltr')[3].children[0].data).replace(/\n/g, '').trim() 
                        tweetInfo.pfpLink =  $('.avatar')[0].children[0].next.attribs.src
                        var username = $('.screen-name').text()
                        tweetInfo.id = $('.tweet-text')[0].attribs['data-id']
                        tweetInfo.img = ($(".w-mediaonebox")).find('img')[0].attribs.src
                        //tweetInfo.timestamp = $('.js-short-timestamp')[instances[handle].pinned].attribs['data-time-ms']
                        /*if(tweetInfo.img !=  undefined){
                            tweetInfo.img = tweetInfo.img.attribs['data-image-url']
                        }*/
                        //tweetInfo.tweet = ($('.js-stream-tweet')[instances[handle].pinned])
                        /*fs.writeFile('twitterHtml.html', response.data, function (err) {
                            if (err) return console.log(err);
                            console.log('Hello World > helloworld.txt');
                        });*/


                        
                        instances[handle].newID = tweetInfo.id
                        instances[handle].ready = true
                        if(instances[handle].newID !=  instances[handle].oldID ){
                            instances[handle].oldID = instances[handle].newID
                            if(tweetInfo.img == instances[handle].oldImg){
                                instances[handle].oldImg = tweetInfo.img
                                tweetInfo.img = undefined
                            }
                            sendWebhook(tweetInfo)
                            sendTweet(tweetInfo)
                            //console.log(tweetInfo.img)
                        }
                    }catch(err) {
                    console.log('error')
                    //console.log(body)
                    instances[handle].ready = true
                    }
                }



            })
        }
                /*
                .catch(function (error) {
                    console.log(error)
                    instances[handle].ready = true
                })
                .then(function(){
                    instances[handle].ready = true
                })
                */
    
        



        // newTweet = getLatestTweet(await getHTML('https://twitter.com/' +handle))





        //if((await newTweet).message != (await oldTweet).message){
        //    oldTweet = newTweet
        //    console.log(newTweet)
        //}
        // 
        
    
    },0);

    //firstTweet(handle)
}

console.log(snowflakeToTimestamp(1267991089564319744))
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
          console.log(body)
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
    
    mainWindow.webContents.send('new:tweet', tweetInfo.pfpLink, 'polarisAIO','polarisAIO',date,time,tweetInfo.message,tweetInfo.img);

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
    console.log('Cleared @'+handle )
    clearInterval(instances[handle])
    var newInstances = []
    for(strName in instances){
        if(strName != handle){
            newInstances[strName] = instances[strName]
        }
    }
    instances = newInstances
    //console.log(newInstances)

}












































