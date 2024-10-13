import "dotenv/config";

const URL = "https://bff.malarenergi.se/spotpriser/api/v1/prices/area/SE3";
const TELEGRAM_URL = "https://api.telegram.org";

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const createMessage = (spot, prefix) => {
  const start = new Date(spot.startDateTime).getHours();
  const end = new Date(spot.endDateTime).getHours();
  return `${prefix} (${start}-${end}): ${Number(spot.price).toFixed(3)}`;
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

async function main() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Cannot fetch the spot price");

  const data = await res.json();
  const now = Date.now();

  const messages = [];
  messages.push(
    `⚡🔌💡 Date ${new Intl.DateTimeFormat("en-UK").format(now)}\n`
  );
  messages.push(createMessage(data.current, "Current"));
  messages.push(createMessage(data.todayMin, "Today min"));
  messages.push(createMessage(data.todayMax, "Today max"));

  messages.push("");
  const nextOccurrences = data.intervals.filter(
    (d) => new Date(d.startDateTime) > now
  );
  let count = 0;
  for (const nextOccurrence of nextOccurrences) {
    messages.push(createMessage(nextOccurrence, "Next"));
    count++;
    if (count >= 5) break;
  }

  const notificationMessages = messages.join("\n").trim();
  await notifyToTelegram(notificationMessages);

  console.log(`
Sent telegram notification:

${notificationMessages}
`);
  process.exit(0);
}

main().catch(console.error);
