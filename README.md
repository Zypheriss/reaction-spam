# Discord Reaction Bot

Bu proje, birden fazla Discord tokenı kullanarak belirli bir mesaja reaction (tepki) eklemek için kullanılır.

## Kurulum

1. Node.js'in yüklü olduğundan emin olun (v16 veya üzeri)
2. Bağımlılıkları yükleyin:
```bash
npm install
```

## Kullanım

1. `zyp.txt` dosyasını açın ve her satıra bir Discord token girin
2. Programı çalıştırın:
```bash
npm start
```
veya
```bash
node index.js
```

3. Program size mesaj bağlantısını soracak. Discord'da bir mesaja sağ tıklayıp "Mesajı Kopyala" seçeneğini kullanarak bağlantıyı alabilirsiniz bunuda beceremezsen direkt dosyayı sil .

## Özellikler

- `zyp.txt` dosyasındaki tüm token'ları okur
- Her token için ayrı bir Discord client oluşturur
- Belirtilen mesajdaki mevcut reaction'ları kontrol eder
- Eğer birden fazla reaction varsa, rastgele birini seçer 
- Seçilen reaction'ı mesaja ekler

## Önemli Notlar

- Tokeninizi aldıktan sonra hesabınızdan çıkış yapı seçip çıkıyorsunuz sonra discord tokeninizi sıfırlıyor bu kodsal bir hata değildir senden kaynaklı bana gelme

## Mesaj URL Formatı

Mesaj URL'si şu formatta olmalıdır:
```
https://discord.com/channels/GUILD_ID/CHANNEL_ID/MESSAGE_ID


örnek : https://discord.com/channels/1369323746397130824/1377709213882515516/1457248115043074149
```


