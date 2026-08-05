import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
  const defaultContent = `PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/marineradar
NODE_ENV=development
`;
  fs.writeFileSync(envPath, defaultContent, 'utf-8');
  console.log('✅ .env dosyası bulunamadı, varsayılan değerlerle otomatik oluşturuldu.');
}
