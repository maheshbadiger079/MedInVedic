const { initDB, run, get } = require('./server/database');

async function fix() {
  await initDB();
  const email = 'maheshbadiger079@gmail.com';
  const user = get('SELECT id FROM users WHERE email = ?', [email]);
  if (user) {
    run('UPDATE users SET role = "admin" WHERE email = ?', [email]);
    console.log(`✅ User ${email} promoted to admin.`);
  } else {
    run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Mahesh', email, 'google_user', 'admin']);
    console.log(`✅ User ${email} created as admin.`);
  }
}

fix().then(() => process.exit());
