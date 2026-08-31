const { initDB, run, all } = require('./server/database');

async function addNewDoctors() {
  await initDB();
  
  const newDoctors = [
    { name: 'Dr. Sangeeta Rao', spec: 'Dermatologist', rating: 4.9, reviews: 1540, exp: '12 years', fee: 600, clinic: 'SkinHealth Clinic, Pune', lat: 18.5126, lng: 73.8735, image: 'doc6.png' },
    { name: 'Dr. Vikram Malhotra', spec: 'Cardiologist', rating: 4.9, reviews: 2890, exp: '22 years', fee: 900, clinic: 'Cardro Hospital, Pune', lat: 18.5204, lng: 73.8567, image: 'doc7.png' },
    { name: 'Dr. Anjali Gupta', spec: 'Ayurvedic Vaidya', rating: 4.8, reviews: 2100, exp: '20 years', fee: 450, clinic: 'Shanti Ayurveda Center, Pune', lat: 18.5089, lng: 73.8340, image: 'doc8.png' },
    { name: 'Dr. Rajesh Khanna', spec: 'Pediatrician', rating: 4.7, reviews: 1870, exp: '15 years', fee: 500, clinic: 'KidsCare Clinic, Pune', lat: 18.5500, lng: 73.9300, image: 'doc9.png' }
  ];

  for (const d of newDoctors) {
    const exists = all('SELECT id FROM doctors WHERE name = ?', [d.name]);
    if (exists.length === 0) {
      run(`INSERT INTO doctors (name, spec, emoji, rating, reviews, exp, fee, address, city, image_url, lat, lng) 
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, 
           [d.name, d.spec, '👨‍⚕️', d.rating, d.reviews, d.exp, d.fee, d.clinic, 'Pune', d.image, d.lat, d.lng]);
      console.log(`✅ Created ${d.name} (${d.spec})`);
    } else {
      run('UPDATE doctors SET image_url = ?, spec = ?, fee = ?, address = ? WHERE name = ?', 
          [d.image, d.spec, d.fee, d.clinic, d.name]);
      console.log(`✅ Updated ${d.name}`);
    }
  }
}

addNewDoctors().then(() => {
  console.log('✨ Additional doctors synced to database.');
  process.exit();
});
