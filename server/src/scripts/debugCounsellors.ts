import { connectDatabase } from '../config/database';
import { User } from '../models';

const debug = async () => {
  await connectDatabase();

  const counsellors = await User.find({ role: 'counsellor', isActive: true }).select(
    'firstName lastName email department avatar _id'
  );

  console.log(`Found ${counsellors.length} active counsellors:`);
  counsellors.forEach((c) => {
    console.log(`  - ${c.firstName} ${c.lastName} (${c.email}) [ID: ${c._id}]`);
  });

  const allUsers = await User.find({}).select('firstName lastName email role _id');
  console.log('\nAll users in DB:');
  allUsers.forEach((u) => {
    console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) [${u.role}]`);
  });

  process.exit(0);
};

debug().catch(console.error);
