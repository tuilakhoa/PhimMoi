import fetch from 'node-fetch';

async function run() {
  console.log("Calling /api/ophim-movies/danh-sach/phim-moi-cap-nhat");
  try {
    const res = await fetch('http://localhost:3000/api/ophim-movies/danh-sach/phim-moi-cap-nhat?page=1');
    const json = await res.json();
    console.log("Ophim OK:", json.status);
  } catch (e) {
    console.log("Ophim error", e);
  }

  console.log("Calling /api/v1/adult/movies");
  try {
    const res = await fetch('http://localhost:3000/api/v1/adult/movies');
    const json = await res.json();
    console.log("Adult movies OK:", !!json.data);
  } catch (e) {
    console.log("Adult movies error", e);
  }
}

run();
