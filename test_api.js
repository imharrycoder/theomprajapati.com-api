import https from 'https';

https.get('https://api.theomprajapati.com/videos', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
}).on('error', (err) => console.error(err));
