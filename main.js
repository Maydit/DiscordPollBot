const Discord = require('discord.io');
const auth = require('./auth.json');

//All options
const NONE = 0;
const SEEN = 1;

/*
Add bot:
https://discordapp.com/oauth2/authorize?&client_id=555173602006138890&scope=bot&permissions=67648
*/

const bot = new Discord.Client({
    token: auth.token,
    autorun: true,
});

bot.setPresence({
    game: {
        name: "!pollhelp"
    }
});

bot.on('message', async function(user, userID, channelID, message, evt) {
    if(user.bot == true) {
        return; //no infinite loops
    }
    //user wants help: print useage and options
    if(message.indexOf("!pollhelp") != -1) {
        bot.sendMessage({
            to: channelID,
            message: "Include \"!poll\" in your message to add poll reactions. Optionally add a type immediately after. Types: seen"
        });
        return;
    } 
    //main case: create a poll below a message
    const loc = message.indexOf("!poll");
    const mID = evt.d.id;
    if(loc != -1) {
        const optionPos = loc + 5;
        let option = NONE; // enum for option
        if(optionPos < message.length) {
            const optionStr = message.substring(optionPos);
            if(optionStr.toLowerCase.indexOf("seen") != -1) option = SEEN;
        }
        switch (option) {
            case NONE:
                bot.addReaction({
                    channelID: channelID,
                    messageID: mID,
                    reaction: "👍"
                });
                bot.addReaction({
                    channelID: channelID,
                    messageID: mID,
                    reaction: "👎"
                })
                break;
            case SEEN:
                bot.addReaction({
                    channelID: channelID,
                    messageID: mID,
                    reaction: "👌"
                })
                break;
            default:
                break;
        }
        return;
    }
});