const { initDB, run, all } = require('./server/database');

async function updateDoctors() {
  await initDB();
  
  // 1. Add image_url column if not exists
  try {
    run('ALTER TABLE doctors ADD COLUMN image_url TEXT');
    console.log('✅ Added image_url column to doctors table.');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('ℹ️ image_url column already exists.');
    } else {
      console.error('❌ Error adding column:', e.message);
    }
  }

  // 2. Update existing doctors with images
  const updates = [
    { name: 'Dr. Shailesh Phalle', img: 'doc1.png' },
    { name: 'Dr. Manoj Deshpande', img: 'doc2.png' },
    { name: 'Dr. Dhananjay Kelkar', img: 'doc3.png' },
    { name: 'Dr. Amit Kashid', img: 'doc4.png' },
    { name: 'Dr. Narendra Shekade', img: 'doc5.png' }
  ];

  for (const u of updates) {
    run('UPDATE doctors SET image_url = ? WHERE name = ?', [u.img, u.name]);
    console.log(`✅ Updated ${u.name} with ${u.img}`);
  }
  
  // 3. Ensure Dr. Narendra Shekade exists
  const exists = all('SELECT id FROM doctors WHERE name = ?', ['Dr. Narendra Shekade']);
  if (exists.length === 0) {
    run(`INSERT INTO doctors (name, spec, emoji, rating, reviews, exp, fee, address, city, image_url) 
         VALUES (?,?,?,?,?,?,?,?,?,?)`, 
         ['Dr. Narendra Shekade', 'Ayurvedic Specialist', '👨‍⚕️', 4.6, 920, '15 years', 250, 'Ayush Ayurved Clinic, Kharadi, Pune', 'Pune', 'doc5.png']);
    console.log('✅ Created missing Dr. Narendra Shekade profile.');
  }
}

updateDoctors().then(() => {
  console.log('✨ Doctor database synchronization complete.');
  process.exit();
});
