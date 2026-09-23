const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

async function searchPrice() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado\n');
    console.log('🔍 Buscando el precio 44.159999999998...\n');

    // Buscar en todas las tablas
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    for (const table of tables.rows) {
      try {
        // Buscar en columnas de texto o JSON
        const result = await client.query(`
          SELECT * FROM ${table.table_name}
          WHERE ${table.table_name}::text LIKE '%44.159999999998%'
          LIMIT 5
        `);

        if (result.rows.length > 0) {
          console.log(`\n✅ ENCONTRADO EN: ${table.table_name}`);
          console.log('Datos:');
          result.rows.forEach(row => {
            console.log(JSON.stringify(row, null, 2));
          });
        }
      } catch (e) {
        // Ignorar errores de sintaxis
      }
    }

    console.log('\n✅ Búsqueda completada');

  } catch (error) {
    console.error('❌', error.message);
  } finally {
    await client.end();
  }
}

searchPrice();
