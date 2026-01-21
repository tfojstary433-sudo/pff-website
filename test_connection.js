const https = require('https');

const url = 'https://match-tracker-node--motorola4interi.replit.app/api/match/status';

console.log('Testing URL:', url);

https.get(url, (res) => {
  console.log('StatusCode:', res.statusCode);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });

}).on('error', (e) => {
  console.error('Error:', e);
});
