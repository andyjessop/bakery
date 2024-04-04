// gh issue list --state open --limit 100 --json title,body,labels,assignees,createdAt,url --repo cloudflare/workers-sdk | bun run ./scripts/parse.ts
const input = Bun.file("./input.json");
const t = await new Response(process.stdin).text();
console.log(JSON.parse(t));
