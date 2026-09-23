const { Client } = require('pg');

const DATABASE_URL = 'postgres://ufolpg2u8inpq5:p7b4b8075420d9a93557934db3e5fbb550efaff74a0104cab8f9048c8fc2e20b8@c72g81hspn0p64.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com:5432/ddp8hbi9tlsode';

const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const CHANNEL_STATUS_ENABLED = 1;
const CHANNEL_STATUS_MANUALLY_DISABLED = 2;
const CHANNEL_STATUS_AUTO_DISABLED = 3;

async function fixDisabledKeys() {
    try {
        await client.connect();
        console.log('Connected to database\n');

        // Query channels
        const result = await client.query(
            'SELECT id, name, type, status, key, channel_info FROM channels ORDER BY id'
        );

        console.log('=== CHANNEL STATUS ANALYSIS ===\n');

        const channelsToFix = [];

        for (const channel of result.rows) {
            const statusName = channel.status === CHANNEL_STATUS_ENABLED ? 'ENABLED'
                : channel.status === CHANNEL_STATUS_AUTO_DISABLED ? 'AUTO-DISABLED'
                : channel.status === CHANNEL_STATUS_MANUALLY_DISABLED ? 'MANUALLY-DISABLED'
                : 'UNKNOWN';

            console.log(`Channel #${channel.id}: ${channel.name}`);
            console.log(`  Channel Status: ${statusName} (${channel.status})`);

            // Parse channel_info
            let channelInfo = {};
            try {
                if (channel.channel_info) {
                    channelInfo = JSON.parse(channel.channel_info);
                }
            } catch (e) {
                console.log('  Error parsing channel_info:', e.message);
                continue;
            }

            // Check the key field
            const keys = channel.key ? channel.key.trim().split('\n').filter(k => k.length > 0) : [];
            console.log(`  Number of keys: ${keys.length}`);

            if (channelInfo.is_multi_key && channelInfo.multi_key_status_list) {
                const statusList = channelInfo.multi_key_status_list;
                let enabledCount = 0;
                let disabledCount = 0;
                const disabledKeys = [];

                for (let i = 0; i < keys.length; i++) {
                    const status = statusList[i];
                    if (status === CHANNEL_STATUS_ENABLED) {
                        enabledCount++;
                    } else if (status === CHANNEL_STATUS_AUTO_DISABLED || status === CHANNEL_STATUS_MANUALLY_DISABLED) {
                        disabledCount++;
                        const reason = channelInfo.multi_key_disabled_reason?.[i] || 'No reason given';
                        disabledKeys.push({ index: i, status, reason });
                    } else {
                        // Default to enabled if not specified
                        enabledCount++;
                    }
                }

                console.log(`  Enabled keys: ${enabledCount}`);
                console.log(`  Disabled keys: ${disabledCount}`);

                if (disabledCount > 0) {
                    console.log('  Disabled key details:');
                    for (const dk of disabledKeys) {
                        console.log(`    - Key #${dk.index}: Status ${dk.status}, Reason: ${dk.reason}`);
                    }
                }

                if (enabledCount === 0 && keys.length > 0) {
                    console.log('  ⚠️  PROBLEM: ALL KEYS ARE DISABLED!');
                    console.log('  This will cause "no enabled keys" error and panic at relay.go:346');
                    channelsToFix.push({
                        id: channel.id,
                        name: channel.name,
                        channelInfo,
                        numKeys: keys.length
                    });
                }
            } else if (!channelInfo.is_multi_key && keys.length > 0) {
                console.log('  Single-key mode (key is always used)');
            } else if (keys.length === 0) {
                console.log('  ⚠️  WARNING: No API keys configured!');
            }

            console.log('');
        }

        // Offer to fix
        if (channelsToFix.length > 0) {
            console.log('\n=== CHANNELS REQUIRING FIX ===\n');
            for (const ch of channelsToFix) {
                console.log(`Channel #${ch.id}: ${ch.name}`);
                console.log(`  Has ${ch.numKeys} key(s) but ALL are disabled`);
            }

            console.log('\n=== FIX OPTIONS ===\n');
            console.log('Option 1: Re-enable all keys (clears the multi_key_status_list)');
            console.log('Option 2: Re-enable only the first key in each channel');
            console.log('Option 3: Just show SQL commands (manual execution)');
            console.log('\nTo apply Option 1, run: node scripts/fix-disabled-keys.js --fix-all');
            console.log('To apply Option 2, run: node scripts/fix-disabled-keys.js --fix-first');
            console.log('To see SQL only, run: node scripts/fix-disabled-keys.js --sql-only');
        } else {
            console.log('✅ No channels found with all keys disabled.');
            console.log('The problem might be:');
            console.log('  1. No API keys configured in channels at all');
            console.log('  2. Channel itself is disabled (status != 1)');
            console.log('  3. Database connection issue in the running application');
        }

        // Handle fix options from command line
        const arg = process.argv[2];
        if (arg === '--fix-all' && channelsToFix.length > 0) {
            console.log('\n=== APPLYING FIX: RE-ENABLE ALL KEYS ===\n');
            for (const ch of channelsToFix) {
                // Clear the disabled status list to re-enable all keys
                ch.channelInfo.multi_key_status_list = {};
                if (ch.channelInfo.multi_key_disabled_reason) {
                    ch.channelInfo.multi_key_disabled_reason = {};
                }
                if (ch.channelInfo.multi_key_disabled_time) {
                    ch.channelInfo.multi_key_disabled_time = {};
                }

                const updatedChannelInfo = JSON.stringify(ch.channelInfo);
                await client.query(
                    'UPDATE channels SET channel_info = $1, status = $2 WHERE id = $3',
                    [updatedChannelInfo, CHANNEL_STATUS_ENABLED, ch.id]
                );
                console.log(`✅ Fixed channel #${ch.id}: ${ch.name} - all keys re-enabled`);
            }
            console.log('\n✅ All channels fixed! Restart your application to pick up the changes.');
        } else if (arg === '--fix-first' && channelsToFix.length > 0) {
            console.log('\n=== APPLYING FIX: RE-ENABLE FIRST KEY ===\n');
            for (const ch of channelsToFix) {
                // Keep status list but clear status for key 0
                if (ch.channelInfo.multi_key_status_list && ch.channelInfo.multi_key_status_list[0]) {
                    delete ch.channelInfo.multi_key_status_list[0];
                }
                if (ch.channelInfo.multi_key_disabled_reason && ch.channelInfo.multi_key_disabled_reason[0]) {
                    delete ch.channelInfo.multi_key_disabled_reason[0];
                }
                if (ch.channelInfo.multi_key_disabled_time && ch.channelInfo.multi_key_disabled_time[0]) {
                    delete ch.channelInfo.multi_key_disabled_time[0];
                }

                const updatedChannelInfo = JSON.stringify(ch.channelInfo);
                await client.query(
                    'UPDATE channels SET channel_info = $1, status = $2 WHERE id = $3',
                    [updatedChannelInfo, CHANNEL_STATUS_ENABLED, ch.id]
                );
                console.log(`✅ Fixed channel #${ch.id}: ${ch.name} - first key re-enabled`);
            }
            console.log('\n✅ All channels fixed! Restart your application to pick up the changes.');
        } else if (arg === '--sql-only' && channelsToFix.length > 0) {
            console.log('\n=== SQL COMMANDS (for manual execution) ===\n');
            for (const ch of channelsToFix) {
                ch.channelInfo.multi_key_status_list = {};
                if (ch.channelInfo.multi_key_disabled_reason) {
                    ch.channelInfo.multi_key_disabled_reason = {};
                }
                if (ch.channelInfo.multi_key_disabled_time) {
                    ch.channelInfo.multi_key_disabled_time = {};
                }

                const updatedChannelInfo = JSON.stringify(ch.channelInfo).replace(/'/g, "''");
                console.log(`-- Fix channel #${ch.id}: ${ch.name}`);
                console.log(`UPDATE channels SET channel_info = '${updatedChannelInfo}', status = ${CHANNEL_STATUS_ENABLED} WHERE id = ${ch.id};\n`);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

fixDisabledKeys();
