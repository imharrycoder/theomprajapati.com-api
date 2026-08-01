import https from 'https';

const check = () => {
  https.get('https://api.theomprajapati.com/videos', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response:', res.statusCode, data);
      if (data.includes('Internal Server Error') && !data.includes('message')) {
        setTimeout(check, 10000); // Check again in 10s
      }
    });
  }).on('error', (err) => console.error(err));
};

check();
