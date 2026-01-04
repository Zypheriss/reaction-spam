const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
function readToken() {
    try {
        const data = fs.readFileSync('zyp.txt', 'utf-8');
        const token = data.split(/\r?\n/)[0]
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, '')
            .trim()
            .replace(/[^\w.\-]/g, '');
        return token;
    } catch (error) {
        console.error('zyp.txt dosyası okunamadı:', error.message);
        process.exit(1);
    }
}
async function testToken() {
    const token = readToken();
    console.log('Token test ediliyor...\n');
    
    const client = new Client({
        checkUpdate: false
    });
    
    client.once('ready', () => {
        console.log('✓ Token geçerli');
        console.log(`Kullanıcı: ${client.user.tag} (${client.user.id})`);
        client.destroy();
        process.exit(0);
    });
    
    client.on('error', (error) => {
        console.error('✗ Hata:', error.message);
    });
    
    try {
        await client.login(token);
    } catch (error) {
        console.error('✗ Token geçersiz:', error.message);
        process.exit(1);
    }
}

testToken().catch(console.error);

