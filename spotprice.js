import "dotenv/config";
import {
  format,
  addDays,
  parseJSON,
  startOfHour,
  isToday,
  eachHourOfInterval,
  addHours,
} from "date-fns";

const URL = "https://bff.malarenergi.se/spotpriser/api/v1/prices/area/SE3";
const TELEGRAM_URL = "https://api.telegram.org";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const toNumber = (v) => Number(v).toFixed(3);

const createMessage = (spot, prefix) => {
  if (spot?.TimeStampHour === undefined) return null;

  const start = Number(spot.TimeStampHour.split(":")[0]);
  const end = start + 1;
  return `${prefix} (${String(start).padStart(2, "0")}-${String(end).padStart(
    2,
    "0"
  )}): ${toNumber(spot.Value)}`;
};

const notifyToTelegram = async (message) => {
  const res = await fetch(`${TELEGRAM_URL}/bot${ACCESS_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": `application/json`,
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
};

const getHourlyPrice = async () => {
  // vattenfall
  const now = new Date();
  const dayAfterTomorrow = addDays(now, 2);
  const url = `https://www.vattenfall.se/api/price/spot/pricearea/${format(
    now,
    "yyyy-MM-dd"
  )}/${format(dayAfterTomorrow, "yyyy-MM-dd")}/SN3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Cannot fetch the electric price`);

  const data = await res.json();
  const spots = new Map();
  let todayMin = {
    Value: Number.MAX_SAFE_INTEGER,
  };
  let todayMax = {
    Value: Number.MIN_SAFE_INTEGER,
  };
  let todayTotal = 0;
  let todayCount = 0;
  data.forEach((d) => {
    const date = parseJSON(`${d.TimeStamp}+02:00`);
    spots.set(date.toISOString(), d);
    if (isToday(date)) {
      todayTotal += d.Value;
      todayCount++;
      todayMin = d.Value < todayMin.Value ? d : todayMin;
      todayMax = d.Value > todayMax.Value ? d : todayMax;
    }
  });
  const next5hrs = eachHourOfInterval({
    start: addHours(startOfHour(now), 1),
    end: addHours(startOfHour(now), 5),
  });

  return {
    current: spots.get(startOfHour(now).toISOString()),
    todayMax,
    todayMin,
    todayAvg: toNumber(todayTotal / todayCount),
    next: next5hrs.map((d) => spots.get(d.toISOString())),
  };
};

async function main() {
  const spotPrices = await getHourlyPrice();

  const messages = [];
  messages.push(`⚡🔌💡 Date ${format(new Date(), "dd/MM/yyyy")}\n`);

  messages.push(createMessage(spotPrices.current, "Current"));
  messages.push(createMessage(spotPrices.todayMin, "Today min"));
  messages.push(createMessage(spotPrices.todayMax, "Today max"));
  messages.push(`Average: ${toNumber(spotPrices.todayAvg)}`);

  messages.push("");
  for (const nextOccurrence of spotPrices.next) {
    messages.push(createMessage(nextOccurrence, "Next"));
  }

  const notificationMessages = messages.filter(Boolean).join("\n").trim();
  await notifyToTelegram(notificationMessages);

  console.log(`
Sent telegram notification:

${notificationMessages}
`);
  process.exit(0);
}

main().catch(console.error);
