const URL = "https://bff.malarenergi.se/spotpriser/api/v1/prices/area/SE3";
const LINE_API_URL = "https://api.line.me/v2/bot/message/push";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const USER_OR_GROUP_ID = process.env.USER_OR_GROUP_ID;

const createMessage = (spot, prefix) => {
  const start = new Date(spot.startDateTime).getHours();
  const end = new Date(spot.endDateTime).getHours();
  return `${prefix} (${start}-${end}): ${Number(spot.price).toFixed(3)}`;
};

const notify = async (message) => {
  const body = new FormData();
  body.append("message", message);
  const res = await fetch(LINE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": `application/json`,
    },
    body: JSON.stringify({
      to: USER_OR_GROUP_ID,
      messages: [
        {
          type: "text",
          text: message,
        },
      ],
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
  messages.push(`Date ${new Intl.DateTimeFormat("en-UK").format(now)}\n`);
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
  await notify(notificationMessages);

  console.log(`
Sent line notification:

${notificationMessages}
`);
  process.exit(0);
}

main().catch(console.error);
