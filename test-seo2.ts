async function check() {
  const filmRes = await fetch('http://localhost:3000/film/gia-nghiep');
  const filmText = await filmRes.text();
  console.log('--- INFO PAGE ---');
  console.log('Title:', filmText.match(/<title>(.*?)<\/title>/)?.[1]);
  console.log('Canonical:', filmText.match(/<link rel="canonical" href="(.*?)"/i)?.[1]);

  const watchRes = await fetch('http://localhost:3000/xem-phim/gia-nghiep/tap-1');
  const watchText = await watchRes.text();
  console.log('--- WATCH PAGE ---');
  console.log('Title:', watchText.match(/<title>(.*?)<\/title>/)?.[1]);
  console.log('Canonical:', watchText.match(/<link rel="canonical" href="(.*?)"/i)?.[1]);
}
check();
