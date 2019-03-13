const Discord = require('discord.io');
const auth = require('./auth.json');
const emojiregex = require('emoji-regex');

//All options
const NONE = 0;
const SEEN = 1;
const TEST = 2;
const CUSTOM = 9;

/*
Add bot:
https://discordapp.com/oauth2/authorize?&client_id=555173602006138890&scope=bot&permissions=67648
*/

const bot = new Discord.Client({
    autorun: true,
    token: auth.token,
});

bot.setPresence({
    game: {
        name: "!pollhelp"
    }
});

bot.on('ready', function(event) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});

bot.on('message', async function(user, userID, channelID, message, evt) {
    if(user.bot == true) {
        return; //no infinite loops
    }
    //user wants help: print useage and options
    if(message.indexOf("!pollhelp") != -1) {
        bot.sendMessage({
            to: channelID,
            message: "Include \"!poll\" in your message to add poll reactions. Optionally add a type immediately after. Types: seen, custom"
        });
        return;
    } 
    //main case: create a poll below a message
    const loc = message.indexOf("!poll");
    const mID = evt.d.id;
    if(loc != -1) {
        const optionPos = loc + 6;
        let option = NONE; // enum for option
        if(optionPos < message.length) {
            const optionStr = message.substring(optionPos).split(" ")[0];
            if(optionStr.toLowerCase().indexOf("seen") != -1) option = SEEN;
            if(optionStr.toLowerCase().indexOf("custom") != -1) option = CUSTOM;
            if(optionStr.toLowerCase().indexOf("test") != -1) option = TEST;
        }
        switch (option) {
            case NONE:
                addAllReactions(["👍", "👎"], channelID, mID);
                break;
            case SEEN:
                addAllReactions(["👌"], channelID, mID);
                break;
            case CUSTOM:
                let match;
                let customReactions = [];
                const regex = emojiregex();
                //get reactions in original message
                //TODO: fix case of multiple emojis
                while(match = regex.exec(message)) {
                    const emoji = match[0];
                    customReactions.push(`${emoji}`);
                }
                addAllReactions(customReactions, channelID, mID);
                break;
            case TEST:
                addAllReactions(["fuuu"]);
                break;
            default:
                break;
        }
        return;
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addAllReactions(reactions, cID, mID) {
    for(let i = 0; i < reactions.length; ++i) {
        console.log(`Attempting to add reaction: ${reactions[i]}`);
        bot.addReaction({
            channelID: cID,
            messageID: mID,
            reaction: reactions[i]
        });
        if(i !== reactions.length - 1) await sleep(1000);
    }
}