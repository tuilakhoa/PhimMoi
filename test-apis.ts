import fetch from 'node-fetch';

async function testAll() {
  try {
    console.log('Testing TopXX...');
    const top = await fetch('https://topxx.vip/api/v1/movies/latest?page=1&per_page=1').then(r => r.json());
    console.log('TopXX OK:', !!top.data);
  } catch (e) {
    console.log('TopXX ERR:', e.message);
  }

  try {
    console.log('Testing XXVN...');
    const xx = await fetch('https://www.xxvnapi.com/api/phim-moi-cap-nhat?page=1').then(r => r.json());
    console.log('XXVN OK:', !!xx.status);
  } catch (e) {
    console.log('XXVN ERR:', e.message);
  }

  try {
    console.log('Testing VSPHIM...');
    const vs = await fetch('https://nguon.vsphim.com/api/danh-sach/phim-moi-cap-nhat?page=1').then(r => r.json());
    console.log('VSPHIM OK:', !!vs.status);
  } catch (e) {
    console.log('VSPHIM ERR:', e.message);
  }
}

testAll();
