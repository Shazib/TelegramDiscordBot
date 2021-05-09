// index.js

const Discord =require('discord.js');
const { Telegraf } = require('telegraf');
const Dnd = require('./dnd.js');

// Load env variables
require('dotenv').config();

/* Create an instance of telegraf (the tg bot) */

const bot = new Telegraf( process.env.TG_BOT_TOKEN );

/* Set up the TG bot */

bot.use((ctx, next) => {
    const start = new Date();
    return next(ctx).then(() => {
        const ms = new Date() - start
    })
})

/* Handle the 'dc' command by connecting to Discord and geting the list of users in the voice channel  */

function replyMemberQuery( ctx ) {
	// Create the DC client
	const client = new Discord.Client();

	// Login 
	client.login( process.env.DC_BOT_TOKEN );

	// Event handler fired when the DC bot is ready
	client.on( 'ready', () => {
		console.log( 'DC Bot is Ready' );

		// Get all the active members in the channel we care about
		client.channels.fetch( process.env.DC_GENERAL_VOICE_CHANEL_ID )
		.then( channel => {

			// Build up a list of names

			var names = '';

			channel.members.forEach( member => {
				names += member.user.username + '\n';
			});

			// If none found show this
			if( names == '' ) {
				names = 'Nobody Online';
			}

			// Reply to TG 
			ctx.reply( names );

		})
		.catch( console.error );
	});
}

/* Start TG Bot and register 'dc' command which will list users  */

bot.start( (ctx) => ctx.reply('Hey there!') )

bot.command( 'dc', (ctx) => replyMemberQuery(ctx) )

/* AWS Lambda handler function */

exports.handler = (event, context, callback) => {
    
    bot.handleUpdate(event); // make Telegraf process that data

    return callback(null, { // return something for webhook, so it doesn't try to send same stuff again
        statusCode: 200,
        body: '',
    });
};

/* Error Handling */

process.on('uncaughtException', function (err) {
    console.log(err);
}); 
