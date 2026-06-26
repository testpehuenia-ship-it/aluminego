import * as cheerio from 'cheerio';

async function testScrape() {
  const res = await fetch('https://villaAluminé.gob.ar/alojamientos-en-villa-Aluminé-3');
  const html = await res.text();
  const $ = cheerio.load(html);

  const results: any[] = [];
  $('tr').each((i, el) => {
    const title = $(el).find('.item-title').text().trim();
    const phone = $(el).find('.item-phone').text().trim();
    if (title) {
      results.push({ name: title, phone });
    }
  });

  console.log('Found:', results.length);
  console.log(results.slice(0, 15));
}

testScrape();

