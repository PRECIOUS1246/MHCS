import { connectDatabase } from '../config/database';
import { User } from '../models';

const cleanup = async () => {
  await connectDatabase();

  // Delete the old seeded counsellors
  const result = await User.deleteMany({
    email: { $in: ['counsellor@university.edu', 'counsellor2@university.edu'] },
  });

  console.log(`Deleted ${result.deletedCount} old seeded counsellors`);

  // Show remaining counsellors
  const remaining = await User.find({ role: 'counsellor', isActive: true }).select('firstName lastName email _id');
  console.log(`\nRemaining active counsellors: ${remaining.length}`);
  remaining.forEach((c) => {
    console.log(`  - ${c.firstName} ${c.lastName} (${c.email})`);
  });

  process.exit(0);
};

cleanup().catch(console.error);
