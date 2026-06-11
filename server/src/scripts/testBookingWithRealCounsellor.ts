import axios from 'axios';
import { connectDatabase } from '../config/database';
import { User } from '../models';

const API = 'http://localhost:5000/api';

const testBooking = async () => {
  await connectDatabase();

  // Get the student and counsellor from DB
  const student = await User.findOne({ email: '4211231472@gctu.edu.gh' });
  const counsellor = await User.findOne({ email: 'counsellor@gmail.com' });

  if (!student || !counsellor) {
    console.error('Student or counsellor not found in DB');
    process.exit(1);
  }

  console.log(`Testing with:`);
  console.log(`  Student: ${student.firstName} ${student.lastName} (ID: ${student._id})`);
  console.log(`  Counsellor: ${counsellor.firstName} ${counsellor.lastName} (ID: ${counsellor._id})`);
  console.log();

  // Login as student
  try {
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: student.email,
      password: 'Password123!',
    });
    const token = loginRes.data.data.accessToken;
    console.log('✓ Logged in as student');

    // Fetch counsellors
    const csRes = await axios.get(`${API}/appointments/counsellors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✓ Fetched ${csRes.data.data.length} counsellors:`, csRes.data.data.map((c: any) => `${c.firstName} ${c.lastName}`).join(', '));

    // Book appointment
    const bookRes = await axios.post(
      `${API}/appointments/book`,
      {
        counsellorId: counsellor._id.toString(),
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Test booking',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✓ Booking successful:', bookRes.status, bookRes.data);
  } catch (err: any) {
    console.error('✗ Error:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }

  process.exit(0);
};

testBooking().catch(console.error);
