const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

async function findPrices() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado\n');

    // Buscar TODAS las columnas de channels
    const channelsSchema = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'channels'
      ORDER BY ordinal_position;
    `);

    console.log('📋 COLUMNAS DE LA TABLA channels:');
    channelsSchema.rows.forEach(col => console.log(`  - ${col.column_name}`));

    // Ver UN channel completo
    const channelFull = await client.query(`SELECT * FROM channels WHERE id = '1' LIMIT 1`);
    console.log('\n📊 CHANNEL COMPLETO (id=1):');
    console.log(JSON.stringify(channelFull.rows[0], null, 2));

    // Buscar tablas que tengan "model" en el nombre
    const modelTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (
        table_name LIKE '%model%' OR
        table_name LIKE '%price%' OR
        table_name LIKE '%rate%'
      );
    `);

    console.log('\n📋 TABLAS CON MODEL/PRICE/RATE:');
    modelTables.rows.forEach(t => console.log(`  - ${t.table_name}`));

  } catch (error) {
    console.error('❌', error.message);
  } finally {
    await client.end();
  }
}

findPrices();
