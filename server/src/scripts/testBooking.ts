const API = 'http://localhost:5000/api';

async function main() {
  try {
    // Login as demo student
    const loginRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@university.edu', password: 'Password123!' }),
    });
    const loginJson: any = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed', loginJson);
      process.exit(1);
    }
    const token = loginJson.data.accessToken;
    console.log('Logged in, token length', token?.length);

    // fetch counsellors
    const csRes = await fetch(`${API}/appointments/counsellors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const csJson: any = await csRes.json();
    console.log('Counsellors status', csRes.status);
    if (!csRes.ok) {
      console.error('Failed to fetch counsellors', csJson);
      process.exit(1);
    }
    const counsellors = csJson.data;
    console.log('Counsellors found:', counsellors.length);
    if (!counsellors.length) {
      console.error('No counsellors available to book');
      process.exit(1);
    }
    const counsellorId = counsellors[0]._id;

    // Book appointment for tomorrow 10:00 local
    const scheduled = new Date(Date.now() + 24 * 60 * 60 * 1000);
    scheduled.setHours(10, 0, 0, 0);
    const bookingBody = { counsellorId, scheduledAt: scheduled.toISOString(), reason: 'Testing booking from script' };

    const bookRes = await fetch(`${API}/appointments/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bookingBody),
    });
    const bookJson = await bookRes.json();
    console.log('Booking status', bookRes.status, 'response:', bookJson);
    process.exit(bookRes.ok ? 0 : 1);
  } catch (err) {
    console.error('Error during booking test', err);
    process.exit(1);
  }
}

main();
