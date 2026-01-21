const https = require('https');

const data = JSON.stringify({
  timer: '0:01',
  period: 'Pierwsza połowa'
});

const options = {
  hostname: 'match-tracker-node--motorola4interi.replit.app',
  port: 443,
  path: '/api/match/update',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'User-Agent': 'Roblox/Linux'
  }
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
