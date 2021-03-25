require('dotenv').config();
const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const db = require('./queries');

require('./heroku');

/**
 * Create the bot instance.
 */
const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  username: process.env.MC_USERNAME,
  password: process.env.MC_PASSWORD,
  auth: process.env.MC_AUTH,
});

/**
 * Load any plugins for the bot.
 */
/*bot.loadPlugin(require('mineflayer-dashboard')({
  chatPattern: /^» \w+? » /
}));*/

/*bot.once('inject_allowed', () => {
  if (bot.dashboard) {
    // Override the default console.log to display on the dashboard if available.
    global.console.log = bot.dashboard.log;
    global.console.error = bot.dashboard.log;
  }
});*/

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: process.env.PORT || 3000 });
});

const getPlayers = (playersList) => {
  return Object.keys(playersList).filter(p => !p.startsWith('|')).map(u => {
    return {
      uuid: playersList[u].uuid,
      username: playersList[u].username,
    };
  });
};

const registerPlayers = (playersArr) => {
  playersArr.forEach(player => {
    db.createPlayer(player);
  });
};

let status = null;
let reconnectCount = 0;
let mapName = '';

bot.on('spawn', () => {
  const playersArr = getPlayers(bot.players);
  console.log('PLAYERS', playersArr.length, JSON.stringify(playersArr));

  registerPlayers(playersArr);

  bot.chat('/pgm:mapinfo'); // Spits out the map info.
  status = 'MAPINFO';
});

/*bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  console.log('CHAT', username + ': ' + message);
});*/

const sanitizePlayerName = (playerName) => {
  const filter = /([_a-zA-Z0-9]+)/i; // Filters out stars and mod symbols.
  return playerName.match(filter)[0];
};

const traversal = (obj, cb = fn => fn) => {
  if (obj.hasOwnProperty('extra')) {
    obj.extra.forEach(o => {
      cb(o);
      traversal(o, cb);
    });
  }
};

const filterMessages = [
  'was shot by', 'was blown up', 'was slain by', 'was punched out', 'was knocked out', 'was shot out', 'was picked up',
  'was knocked off', 'fell out', 'was blown off', 'was shot off', 'joined the game', 'left the game', 'hit the ground',
  'blocks and died', 'out of the world', 'fell off a high place', 'was sniped off', 'was punched off', 'tripped and fell',
  'was sniped by', 'went splat', 'died', 'was killed by', 'was knocked into', 'was shot into', 'felt the fury', 'was spleefed off',
  'went up in flames'
];

bot.on('message', (jsonMsg) => {
  const stringMessage = jsonMsg.toString();  

  // Filter out death messages
  if (stringMessage.search(filterMessages.join('|')) >= 0) {
    return;
  }

    // Filter out other messages.
  if (stringMessage.startsWith('<')
    || stringMessage.startsWith('[')
    || stringMessage.startsWith('(')
  ) {
    return;
  }

  // Check for statuses emitted by the bot.
  if (status === 'MAPINFO') {
    let mapString = stringMessage.trim();
    mapName = mapString;
    status = null;
    return;
  }

  //  Checks for private messages.
  if (stringMessage.startsWith('From ')) {
    const [, playerData, playerMessage] = stringMessage.split(' ', 3);
    let [playerName,] = playerData.split(':');
    playerName = sanitizePlayerName(playerName);

    // Skip messages that aren't flags ("!").
    if (!playerMessage.startsWith('!')) {
      console.log('MSG', stringMessage);
      return;
    }

    const [command, extra] = playerMessage.substr(1).split(' ');
    
    switch (command) {
      case 'tp':
        if (typeof extra !== 'undefined') {
          // Teleport to a player.
          bot.chat(`/tp ${extra}`);
        } else {
          // Teleport to the same player.
          bot.chat(`/tp ${playerName}`);
        }
        break;
      case 'hello':
        bot.chat(`/msg ${playerName} Greetings, ${playerName}!`);
        break;
      case 'map':
        bot.chat(`/msg ${playerName} Now playing: ${mapName}`);
        break;
      case 'players':
        const playersArr = getPlayers(bot.players);
        bot.chat(`/msg ${playerName} There are currently ${playersArr.length} players online.`);
        break;
      default:
        bot.chat(`/msg ${playerName} Sorry, I don't recognize that command.`);
        return;
    }

    console.log('COMMAND', command, extra);

  }

  // Try to rejoin the server after a certain period.
  if (stringMessage.includes('Reconnecting to Overcast Community')) {
    if (reconnectCount > 12) {
      bot.chat('/occ');
      reconnectCount = 0;
    } else {
      reconnectCount++;
    }
  }

  console.log('SERVER', stringMessage);
});

/*bot.on('whisper', (username, message) => {
  if (username === bot.username) return;
  console.log('WHISPER', username + ': ' + message);
});*/

bot.on('kicked', console.log);
bot.on('error', console.log);
