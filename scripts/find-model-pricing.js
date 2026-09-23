const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

async function findPricing() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado\n');

    // Ver estructura completa de models
    const modelsSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'models'
      ORDER BY ordinal_position;
    `);

    console.log('📋 COLUMNAS DE LA TABLA models:');
    modelsSchema.rows.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));

    // Buscar modelos que tengan precios
    const modelsData = await client.query(`
      SELECT * FROM models
      WHERE model_name IN ('claude-fable-5', 'claude-fable-5.1', 'claude-sonnet-5', 'gpt-4o')
      LIMIT 5
    `);

    console.log('\n📊 MODELOS CON PRECIOS:');
    modelsData.rows.forEach(model => {
      console.log(`\n${model.model_name}:`);
      console.log(JSON.stringify(model, null, 2));
    });

  } catch (error) {
    console.error('❌', error.message);
  } finally {
    await client.end();
  }
}

findPricing();
