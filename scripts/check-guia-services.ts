import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@libsql/client';

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const subs = await client.execute('SELECT * FROM Subscription');
  console.log('Total subscriptions:', subs.rows.length);
  subs.rows.forEach(sub => {
    console.log(`Sub id=${sub.id}, planType=${sub.planType}, localServiceId=${sub.localServiceId}, businessId=${sub.businessId}, commerceId=${sub.commerceId}, accommodationId=${sub.accommodationId}, adventureId=${sub.adventureId}, hasBannerPortada=${sub.hasBannerPortada}, hasBannerTop=${sub.hasBannerTop}, hasBannerMiddle=${sub.hasBannerMiddle}, hasBannerBottom=${sub.hasBannerBottom}`);
  });

  const localServices = await client.execute('SELECT id, name, category, subcategory FROM LocalService');
  console.log('\nTotal LocalServices:', localServices.rows.length);
  
  // Check which local services have direct subscription or matched subscription
  const linkedSubs = subs.rows.filter(s => s.localServiceId);
  console.log('\nDirect LocalService Subscriptions:', linkedSubs.length);
  linkedSubs.forEach(s => {
    const srv = localServices.rows.find(ls => ls.id === s.localServiceId);
    console.log(`- Service: ${srv?.name} (${srv?.category}) => Plan: ${s.planType}`);
  });
}

main().catch(console.error);
