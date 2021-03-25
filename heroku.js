const fetch = require('node-fetch');

/**
 * Send a request to the Heroku dyno before it sleeps.
 */
 if (process.env.HEROKU_URL) {
  const pingDyno = () => {
    fetch(process.env.HEROKU_URL).then(() => {
      console.log('--- WAKE UP ---');
    });
  };
  setInterval(pingDyno, 1200000); // Ping every 20 minutes.
}