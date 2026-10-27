import https from 'node:https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetchPage('https://www.tgju.org/profile/price_dollar_rl');
  // Find where price_dollar_rl appears in html
  const idx = html.indexOf('price_dollar_rl');
  console.log('price_dollar_rl index:', idx);

  // Search for "قیمت زنده" or "نرخ فعلی" or "data-col"
  const colMatches = [...html.matchAll(/data-col="([^"]+)"/g)].map(m => m[1]);
  console.log('data-cols found:', [...new Set(colMatches)].slice(0, 20));

  // Search for header price box or span class="value"
  const spans = [...html.matchAll(/<span[^>]*class="([^"]*value[^"]*)"[^>]*>([\s\S]*?)<\/span>/gi)];
  console.log('Spans count:', spans.length);
  for (const s of spans.slice(0, 10)) {
    console.log(s[1], '-->', s[2].trim().replace(/\s+/g, ' '));
  }

  // Look for tables or price-header
  const headerMatch = html.match(/class="[^"]*info-price[^"]*"[\s\S]{0,300}/);
  console.log('info-price snippet:', headerMatch ? headerMatch[0] : 'None');

  const liveRateMatch = html.match(/<th[^>]*>نرخ فعلی<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>/);
  console.log('Current rate td:', liveRateMatch ? liveRateMatch[1].trim() : 'None');

  const fs = await import('node:fs');
  fs.writeFileSync('scripts/tgju-sample.html', html.slice(0, 100000));
}

main().catch(console.error);
