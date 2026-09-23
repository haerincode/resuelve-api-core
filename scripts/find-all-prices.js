const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

async function findAllPrices() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado\n');

    // Buscar en TODAS las tablas columnas con "input", "output", "cache"
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('🔍 BUSCANDO PRECIOS EN TODAS LAS TABLAS...\n');

    for (const table of tables.rows) {
      const cols = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
        AND (
          column_name ILIKE '%input%' OR
          column_name ILIKE '%output%' OR
          column_name ILIKE '%cache%' OR
          column_name ILIKE '%price%' OR
          column_name ILIKE '%ratio%' OR
          column_name ILIKE '%cost%'
        );
      `, [table.table_name]);

      if (cols.rows.length > 0) {
        console.log(`\n📌 TABLA: ${table.table_name}`);
        console.log(`   Columnas: ${cols.rows.map(c => c.column_name).join(', ')}`);

        // Mostrar ejemplo
        try {
          const sample = await client.query(`SELECT * FROM ${table.table_name} LIMIT 2`);
          if (sample.rows.length > 0) {
            console.log('\n   Ejemplo:');
            console.log(JSON.stringify(sample.rows[0], null, 2));
          }
        } catch (e) {
          console.log('   (no se pudo leer ejemplo)');
        }
      }
    }

  } catch (error) {
    console.error('❌', error.message);
  } finally {
    await client.end();
  }
}

findAllPrices();
