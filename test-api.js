const https = require('https');
https.get('https://ophim1.com/v1/api/phim/cuoc-chien-vinh-hang', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json.data.item.category).slice(0, 200));
  });
});
