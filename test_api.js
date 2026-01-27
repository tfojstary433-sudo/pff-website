
async function test() {
  const r = await fetch('https://2cc8fdff-58f5-4de4-ba18-23c3c389e63d-00-10zd3s5b89sgn.janeway.replit.dev/api/stats');
  const d = await r.json();
  const list = Array.isArray(d) ? d : (d.players || []);
  console.log(JSON.stringify(list.slice(0, 1), null, 2));
}
test();
