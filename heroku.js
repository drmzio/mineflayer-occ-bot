const fetch = require('node-fetch');

/**
 * Send a request to the Heroku dyno before it sleeps.
 */
 if (process.env.HEROKU_URL && process.env.API_URL) {
  const pingDyno = () => {
    fetch(process.env.HEROKU_URL).then(() => {
      console.log('--- WAKE UP BOT ---');
    });
    fetch(process.env.API_URL).then(() => {
      console.log('--- WAKE UP API ---');
    });
  };
  setInterval(pingDyno, 1200000); // Ping every 20 minutes.
}