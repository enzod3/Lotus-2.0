const Discord = require("discord.js");

const cheerio = require('cheerio')
const client = new Discord.Client();
var axios = require('axios')
const config = require("./config.json");
const fs = require("fs")
const { createProxyMiddleware } = require('http-proxy-middleware');
const { request } = require("http");
var alphaNum = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
//let httpsProxyAgent = require('https-proxy-agent');
//var agent = new httpsProxyAgent('http://50010+US+50010-903020:1q8uypm8mb@us-dynamic-1.resdleafproxies.com:15458');
//var agent = new httpsProxyAgent('http://50010+US+50010-903020:1q8uypm8mb@us-dynamic-1.resdleafproxies.com:15458');
//:15458:50010+US+50010-903020:1q8uypm8mb

roleID = config.roleID
color = config.color
colorDec = parseInt(color.substring(1), 16)

client.on('ready', () => {
  console.info(`Logged in as ${client.user.tag}!`);
});

discordDetection = false
pastebinDetection = false
expirementalDetection = false





var proxyList = fs.readFileSync('proxies.txt').toString().split("\n");
var proxyCount = 0
for(i in proxyList) {
    proxyCount = proxyCount+1
}
global.proxyLoopVariable = 0

var newProxy = proxyList[global.proxyLoopVariable].split(":");
global.ip = newProxy[0];
global.port = newProxy[1];

client.on("message", async message => {
    


    if(message.author.bot) return;

    // Also good practice to ignore any message that does not start with our prefix, 
    // which is set in the configuration file.

    if(message.content.indexOf(config.prefix) !== 0) return;

    if(message.member.roles.cache.has(roleID)){}
    else return


    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();



    if(discordDetection == true){
        console.log('dsfojfdj')
        var code = getDiscordCode(message.content)
        if(code != null){
            message.channel.send('**Discord link Detected**')
            message.channel.send('https://discord.gg/'+ code)
        }
    }


    if(expirementalDetection == true){

        var code = expirementalDiscordDetection(message.content, message.channel.id)
        
        if(code != null){
            message.channel.send('**Discord link Detected**')
            message.channel.send('https://discord.gg/'+ code)
        }
        
    }


    
    if(pastebinDetection == true){
        var pasteCode = tryPastebin(message.content)

        console.log(pasteCode)
        //'https://pastebin.com/raw/MqWpRQDs')
        url = "https://pastebin.com/raw/"+ pasteCode.substring(0, 8);
        console.log(url)
        axios.get(url)
        .then(function (response){
            if(discordDetection == true){

                var code = getDiscordCode(response.data)
                if(code != null){
                    message.channel.send('https://discord.gg/'+ code)
                }
            }
            message.channel.send('**Content**\n'+response.data)

        })
        .catch(function (error) {
            message.channel.send('**No such pastebin**')
        })
    }





    if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. `);
    }


    if(command === "help") {
        var helpEmbed = new Discord.MessageEmbed()
            .setColor(colorDec)
            .setTitle('Twitter Command Help')

            .addField(',i *inviteCode*', 'Send a discord invite', false)
            .addField(',p *pastebin code or link*', 'Get contents of pastebin', false)
            .addField(',dd', 'Detects discord links', false)
            .addField(',pp', 'Detects pastebin links', false)
            .addField(',clear', 'Expiremental discord detection', false)

            .setTimestamp()
            .setFooter(groupName+' • Twitter Companion', pfpImg);
    
        await message.channel.send(helpEmbed);
      }


    if(command === "i") {
        message.channel.send('https://discord.gg/'+args[0])
    }
    if(command === "dd"){
        if(discordDetection){
            discordDetection = false
            message.channel.send('**Discord invite detection off**')
        }else{
            discordDetection = true
            message.channel.send('**Discord invite detection on**')
        }
    }


    if(command === "pp"){
        if(pastebinDetection){
            pastebinDetection = false
            message.channel.send('**Pastebin detection off**')
        }else{
            pastebinDetection = true
            message.channel.send('**Pastebin detection on**')
        }
    }

    if(command === "ed"){
        if(expirementalDetection){
            expirementalDetection = false
            message.channel.send('**Expiremental discord detection off**')
        }else{
            expirementalDetection = true
            message.channel.send('**Expiremental discord detection on**')
        }
    }

    if(command === "p") {
        var content = args.join()
        content = content.replace('https://pastebin.com/', '')
        content = content.replace(/\W/g, '')
        
        console.log(content)
        //'https://pastebin.com/raw/MqWpRQDs')
        url = "https://pastebin.com/raw/"+ content.substring(0, 8);
        console.log(url)
        axios.get(url)
        .then(function (response){
            if(discordDetection == true){

                var code = getDiscordCode(response.data)
                if(code != null){
                    message.channel.send('https://discord.gg/'+ code)
                }
            }
            message.channel.send('**Content**\n'+response.data)

        })
        .catch(function (error) {
            message.channel.send('**No such pastebin**')
        })
    }


})



function getDiscordCode(message){
    let re = /((?: +\w){5,6} \w +)/gm
    if(message.match(re) != null){
        var inv = message.match(re)[0]
        inv = inv.replace(/\W/g, '')
        return(inv)
    }else{
        var message = message.replace(/ /g, '');
        keys = ["discord.gg/", "Discord.gg/", "discord.com/invite/", "Discord.com/invite/"]
        contentLineSplit = message.split("\n")
        for (let x of keys) {
            for (let element of contentLineSplit) {
                element = element.split(" ")
                for (let xx of element) {
                    if (xx.includes(x)) {
                        xx = xx.split(x)
                        invite = xx[1]
                        var invite = invite.replace(/ is/g, '')
                        var invite = invite.replace(/word/g, '')
                        var invite = invite.replace(/[^a-zA-Z0-9_-]+/g, '')
    
                        var invite = invite.replace("REMOVETHIS", '')
    
    
                        var invite = invite.replace(/-/g, '')
    
    
    
                        var invite = invite.replace(/one/g, '1')
                        var invite = invite.replace(/two/g, '2')
                        var invite = invite.replace(/three/g, '3')
                        var invite = invite.replace(/four/g, '4')
                        var invite = invite.replace(/five/g, '5')
    
                        var invite = invite.replace(/six/g, '6')
                        var invite = invite.replace(/seven/g, '7')
                        var invite = invite.replace(/eight/g, '8')
                        var invite = invite.replace(/nine/g, '9')
                        var invite = invite.replace(/ten/g, '10')
    
    
                        var invite = invite.replace("/invite/", '')
                        var invite = invite.replace("discord invite Below", '')
                        var invite = invite.replace("Below", '')
                        var invite = invite.replace("below", '')
                        var invite = invite.replace(" Is", '')
    
                        var invite = invite.replace("Is ", '')
                        var invite = invite.replace("discordinvite is", '')
                        return invite

    
                    }
                }
            }
        }
    }
}










function tryPastebin(message){
    
    var message = message.replace(/ /g, '');
    keys = ["https://pastebin.com/"]
    contentLineSplit = message.split("\n")
    for (let x of keys) {
        for (let element of contentLineSplit) {
            element = element.split(" ")
            for (let xx of element) {
                if (xx.includes(x)) {
                    xx = xx.split(x)
                    invite = xx[1]
                    var invite = invite.replace(/ is/g, '')
                    var invite = invite.replace(/word/g, '')
                    var invite = invite.replace(/[^a-zA-Z0-9_-]+/g, '')

                    var invite = invite.replace("REMOVETHIS", '')


                    var invite = invite.replace(/-/g, '')



                    var invite = invite.replace(/one/g, '1')
                    var invite = invite.replace(/two/g, '2')
                    var invite = invite.replace(/three/g, '3')
                    var invite = invite.replace(/four/g, '4')
                    var invite = invite.replace(/five/g, '5')

                    var invite = invite.replace(/six/g, '6')
                    var invite = invite.replace(/seven/g, '7')
                    var invite = invite.replace(/eight/g, '8')
                    var invite = invite.replace(/nine/g, '9')
                    var invite = invite.replace(/ten/g, '10')


                    var invite = invite.replace("/invite/", '')
                    var invite = invite.replace("discord invite Below", '')
                    var invite = invite.replace("Below", '')
                    var invite = invite.replace("below", '')
                    var invite = invite.replace(" Is", '')

                    var invite = invite.replace("Is ", '')
                    var invite = invite.replace("discordinvite is", '')
                    return invite


                }
            }
        }
    }
}





function getDiscordCodeNoReplace(message){
    let re = /((?: +\w){5,6} \w +)/gm
    if(message.match(re) != null){
        var inv = message.match(re)[0]
        inv = inv.replace(/\W/g, '')
        return(inv)
    }else{
        var message = message.replace(/ /g, '');
        keys = ["discord.gg/", "Discord.gg/", "discord.com/invite/", "Discord.com/invite/"]
        contentLineSplit = message.split("\n")
        for (let x of keys) {
            for (let element of contentLineSplit) {
                element = element.split(" ")
                for (let xx of element) {
                    if (xx.includes(x)) {
                        xx = xx.split(x)
                        invite = xx[1]
                        var invite = invite.replace(/ is/g, '')
                        var invite = invite.replace(/word/g, '')
                        //var invite = invite.replace(/[^a-zA-Z0-9_-]+/g, '')
    
                        var invite = invite.replace("REMOVETHIS", '')
    
    
                        var invite = invite.replace(/-/g, '')
    
    
    
                        var invite = invite.replace(/one/g, '1')
                        var invite = invite.replace(/two/g, '2')
                        var invite = invite.replace(/three/g, '3')
                        var invite = invite.replace(/four/g, '4')
                        var invite = invite.replace(/five/g, '5')
    
                        var invite = invite.replace(/six/g, '6')
                        var invite = invite.replace(/seven/g, '7')
                        var invite = invite.replace(/eight/g, '8')
                        var invite = invite.replace(/nine/g, '9')
                        var invite = invite.replace(/ten/g, '10')
    
    
                        var invite = invite.replace("/invite/", '')
                        var invite = invite.replace("discord invite Below", '')
                        var invite = invite.replace("Below", '')
                        var invite = invite.replace("below", '')
                        var invite = invite.replace(" Is", '')
    
                        var invite = invite.replace("Is ", '')
                        var invite = invite.replace("discordinvite is", '')
                        return invite

    
                    }
                }
            }
        }
    }
}







function expirementalDiscordDetection(message,channelID){
    possibleInvite = (getDiscordCodeNoReplace(message))
    replaceKeywords = ["replace"]
    withKeywords = ["with"]
    contentLineSplit = message.split("\n")
    messageArray = []
    for(line of contentLineSplit){
        words = line.split(" ")
        for(word of words){
            messageArray.push(word)
        }
    }
    //console.log(messageArray)
    if(possibleInvite != null){
        hasReplaceKw = false
        for(let replaceKw of replaceKeywords){
            if(messageArray.includes(replaceKw)){
                indexOfReplace = messageArray.indexOf(replaceKw)
            }
            for(let withKw of withKeywords){
                indexOfWith = messageArray.indexOf(withKw)
            }
            //only  works if theres a word between replace and with and a word after with
            if(indexOfReplace > -1 && indexOfWith > -1 && indexOfWith + 1 > indexOfReplace){
                replacePhraseArray = []
                for (var i = indexOfReplace+1; i < indexOfWith; i++) {
                    replaceWord = messageArray[i].replace(/"/g, '').replace(/in/,'').replace(/the/,'')
                    replacePhraseArray.push(replaceWord)
                    //Do something
                }
                var replacePhrase = replacePhraseArray.join(" ")
                insertWord = messageArray[indexOfWith+1]

                //let re = /(\w{1,2})/g
                if(replacePhrase.length == 1){
                    let re = /[!@#$%^&*(),.?":{}|<>]/gm
                    let replaceRegex = replacePhrase.replace(re,myReplace)
                    
                    function myReplace(str) {
                        return "\\" + str ;
                    }   
                    console.log(replaceRegex)
                    replacedCode = possibleInvite.replace(new RegExp(replaceRegex, "g"),insertWord)
                    if(replaceWord != replacedCode && insertWord.length <= 2){

                        return replacedCode                        
                    }else{
                        splitCodeArray = possibleInvite.split(replacePhrase)
                        bruteDiscord(splitCodeArray,channelID)
                    }

                }else{

                }
            }
        }
    }

}
/*

function substitueSingleLetters(word, replacing, toBeReplaced){
    
    wordArray = []
    for(letter of word){
        if(letter == replacing){
            console.log(toBeReplaced)
            wordArray.push(toBeReplaced)
        console.log(wordArray)

        }else{
            wordArray.push(letter)
        }
        console.log(wordArray)
    }
    
    return wordArray.join('')
    
   return word.replace(replacing,toBeReplaced)
}

*/

client.login(config.token);




//var bruhhh = ""
function bruteDiscord(inviteArray, channelID){
    console.log(inviteArray)

    for(let char of alphaNum){
        var inviteCode = inviteArray.join(char)
        var url = "https://discord.com/api/invite/"+inviteCode
        rotateProxy()
        let httpsProxyAgent = require('https-proxy-agent');
        var newProxy = 'http://'+(global.ip)+':14888'
        //console.log(newProxy)
        var agent = new httpsProxyAgent(newProxy);
        var options = {
            httpsAgent: agent
        }

        axios.get(url,options)
            .then(function (response){
                console.log("Found! "+response.config.url)
                //return response.config.url.substring(inviteCode.length)
                var channel = client.channels.cache.get(channelID);
                channel.send('https://discord.gg/'+ response.config.url.substring(response.config.url.length - inviteCode.length))
            })
            .catch(function (error) {
                if(error.response != undefined){
                    console.log(error.response.status)
                    if(error.response.status == 429){
                        rotateProxy()
                    }
                }else{
                    console.log(error)
                }

            })
    }
}

//bruteDiscord([ 'W', 'SUYu' ])
//https://discord.gg/WwSUYu

/*
async function axiosAwait(url,inviteCode){
    await axios.get(url,options)
    .then(function (response){
        var $ = cheerio.load(response.data);
        var title = $("title").text();
        if(title != "Discord"){
            console.log("Found! "+ url)
            //return inviteCode
        }else{
            console.log('not:  '+url)
        }
    })
    .catch(function (error) {
        console.log(error)
    })
}
*/



function rotateProxy(){
    global.proxyLoopVariable = global.proxyLoopVariable +1
    if(global.proxyLoopVariable== proxyCount){
        global.proxyLoopVariable = 0
      }
    //console.log(keyinfo[loopVariable]["API_bearer"])
    var newProxy = proxyList[global.proxyLoopVariable].split(":");
    global.ip = newProxy[0];
    global.port = newProxy[1];
    //console.log(global.ip)
    //console.log(keyinfo[i][loopVariable[i]])
}