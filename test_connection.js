const https = require('https');

const url = 'https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/match/status';

console.log('Testing URL:', url);

https.get(url, (res) => {
  console.log('StatusCode:', res.statusCode);
  
  res.on('data', (d) => {
    process.stdout.write(d);
  });

}).on('error', (e) => {
  console.error('Error:', e);
});
