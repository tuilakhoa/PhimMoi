const https = require('https');
https.get('https://ophim1.com/v1/api/phim/a-year-without-a-job', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(json.data.item.category);
  });
});
