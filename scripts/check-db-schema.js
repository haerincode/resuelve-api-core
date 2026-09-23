const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

async function checkSchema() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Ver todas las tablas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 TABLAS DISPONIBLES:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));

    // Buscar tablas relacionadas con precios/modelos
    const priceTables = tables.rows.filter(t => 
      t.table_name.includes('price') || 
      t.table_name.includes('model') ||
      t.table_name.includes('product')
    );

    if (priceTables.length > 0) {
      console.log('\n🔍 TABLAS DE PRECIOS/MODELOS:');
      for (const table of priceTables) {
        console.log(`\n📊 Tabla: ${table.table_name}`);
        
        // Ver estructura
        const schema = await client.query(`
          SELECT column_name, data_type, character_maximum_length
          FROM information_schema.columns
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `, [table.table_name]);

        console.log('  Columnas:');
        schema.rows.forEach(col => {
          console.log(`    - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
        });

        // Ver ejemplo de datos
        const sample = await client.query(`SELECT * FROM ${table.table_name} LIMIT 3`);
        if (sample.rows.length > 0) {
          console.log('\n  Ejemplo de datos:');
          console.log(JSON.stringify(sample.rows, null, 2));
        }
      }
    }

    // Buscar en TODAS las tablas alguna que tenga columnas de precio
    console.log('\n\n🔎 BUSCANDO COLUMNAS CON "PRICE", "INPUT", "OUTPUT"...');
    for (const table of tables.rows) {
      const cols = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
        AND (
          column_name ILIKE '%price%' OR
          column_name ILIKE '%input%' OR
          column_name ILIKE '%output%' OR
          column_name ILIKE '%cache%' OR
          column_name ILIKE '%model%'
        );
      `, [table.table_name]);

      if (cols.rows.length > 0) {
        console.log(`\n📌 ${table.table_name}:`);
        cols.rows.forEach(c => console.log(`    - ${c.column_name}`));

        // Mostrar ejemplo
        const sample = await client.query(`SELECT * FROM ${table.table_name} LIMIT 2`);
        if (sample.rows.length > 0) {
          console.log('  Ejemplo:');
          console.log(JSON.stringify(sample.rows, null, 2));
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
