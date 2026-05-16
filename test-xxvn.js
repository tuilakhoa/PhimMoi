async function run() {
  const res = await fetch('http://localhost:3000/api/vsphim-movies/danh-sach/phim-moi-cap-nhat').then(r => r.json());
  const slug = res.items[0].slug;
  const detail = await fetch('http://localhost:3000/api/vsphim-movies/phim/'+slug).then(r => r.json());
  console.log(JSON.stringify(detail, null, 2));
}
run();
