const { WebcastPushConnection } = require('tiktok-live-connector');
const app = require('express')();
let events = [];
const conn = new WebcastPushConnection(process.env.TT_USER);

function start() {
  conn.connect().catch(e => {
    console.error(e.message);
    setTimeout(start, 10000);
  });
}
start();
conn.on('disconnected', () => setTimeout(start, 10000));

const add = (a, u) => events.push({ a, u });

const GIFTS = {
  'rose': 'rose',
  'coffee': 'coffee',
  'sakura': 'sakura',
  'stay warm': 'staywarm',
};

conn.on('follow', d => add('follow', d.uniqueId));

conn.on('gift', d => {
  if (d.giftType === 1 && !d.repeatEnd) return; // hitung streak sekali saja
  const name = (d.giftName || '').toLowerCase();
  console.log('GIFT:', d.giftName);
  for (const k in GIFTS) {
    if (name.includes(k)) add(GIFTS[k], d.uniqueId);
  }
});

app.get('/events', (q, r) => { r.json(events); events = []; });
app.listen(process.env.PORT || 3000);
