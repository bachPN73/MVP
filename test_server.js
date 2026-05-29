import http from 'http';
const options = {
  hostname: '127.0.0.1',
  port: 3099,
  path: '/api/ping',
  method: 'GET'
};
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', (d) => process.stdout.write(d));
});
req.on('error', (e) => console.error(`ERROR: ${e.message}`));
req.end();
