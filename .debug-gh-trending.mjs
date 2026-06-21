const key = process.env.FIRECRAWL_API_KEY;
const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ url: "https://github.com/trending?since=daily", formats: ["markdown"] }),
});
const data = await res.json();
const md = data.data.markdown;
const lines = md.split('\n');
// Find lines with repo patterns
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('stars today') || lines[i].includes('star today') || /^\d+[,.\d]*\s*stars?\s*today/.test(lines[i])) {
    console.log(`Line ${i-3}: ${lines[i-3] || ''}`);
    console.log(`Line ${i-2}: ${lines[i-2] || ''}`);
    console.log(`Line ${i-1}: ${lines[i-1] || ''}`);
    console.log(`Line ${i}: ${lines[i]}`);
    console.log(`Line ${i+1}: ${lines[i+1] || ''}`);
    console.log('---');
  }
}
// If nothing found, print last 100 lines
console.log('\n=== LAST 2000 CHARS ===');
console.log(md.slice(-2000));
