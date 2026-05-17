async function check() {
  const op = await fetch(`https://phim.nguonc.com/api/films/the-loai/hanh-dong?year=2023`);
  const data = await op.json();
  console.log(data?.items?.[0]?.created || data?.items?.[0]?.year)
}
check()
