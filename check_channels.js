const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkChannels() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Query channels
        const result = await client.query(
            'SELECT id, name, type, status, key, channel_info FROM channels ORDER BY id'
        );

        console.log('\n=== CHANNELS STATUS ===\n');
        for (const channel of result.rows) {
            console.log(`Channel ID: ${channel.id}`);
            console.log(`Name: ${channel.name}`);
            console.log(`Type: ${channel.type}`);
            console.log(`Status: ${channel.status} (1=enabled, 2=disabled)`);

            // Parse channel_info
            let channelInfo = {};
            try {
                if (channel.channel_info) {
                    channelInfo = JSON.parse(channel.channel_info);
                }
            } catch (e) {
                console.log('Error parsing channel_info:', e.message);
            }

            console.log(`Is Multi-Key: ${channelInfo.is_multi_key || false}`);

            // Check the key field
            const keys = channel.key ? channel.key.trim().split('\n') : [];
            console.log(`Number of keys: ${keys.length}`);

            if (channelInfo.multi_key_status_list) {
                console.log('Key Status List:', channelInfo.multi_key_status_list);

                // Count enabled vs disabled keys
                const statusList = channelInfo.multi_key_status_list;
                let enabledCount = 0;
                let disabledCount = 0;

                for (let i = 0; i < keys.length; i++) {
                    const status = statusList[i];
                    if (status === 1) {
                        enabledCount++;
                    } else if (status === 2) {
                        disabledCount++;
                    } else {
                        // Default to enabled if not specified
                        enabledCount++;
                    }
                }

                console.log(`Enabled keys: ${enabledCount}`);
                console.log(`Disabled keys: ${disabledCount}`);

                if (enabledCount === 0) {
                    console.log('⚠️  WARNING: NO ENABLED KEYS! This will cause the error.');
                }

                if (channelInfo.multi_key_disabled_reason) {
                    console.log('Disabled reasons:', channelInfo.multi_key_disabled_reason);
                }
            } else {
                console.log('No multi-key status list (all keys considered enabled by default)');
            }

            console.log('---');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkChannels();
