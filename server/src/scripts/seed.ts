import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { Appointment, Assessment, Alert, User, Forum, Resource } from '../models';

const seed = async () => {
  await connectDatabase();

  const password = await bcrypt.hash('Password123!', 12);

  const users = [
    { email: 'admin@university.edu', firstName: 'System', lastName: 'Admin', role: 'admin' as const },
    { email: 'admin2@university.edu', firstName: 'Emma', lastName: 'Manager', role: 'admin' as const },
    { email: 'student@university.edu', firstName: 'Alex', lastName: 'Student', role: 'student' as const, studentId: 'STU001' },
  ];

  for (const u of users) {
    await User.findOneAndUpdate(
      { email: u.email },
      { ...u, password, isEmailVerified: true, anonymousNickname: `User${Math.floor(Math.random() * 9999)}` },
      { upsert: true }
    );
  }

  const admin = await User.findOne({ email: 'admin@university.edu' });

  const forums = [
    { title: 'Anxiety Support', description: 'Share experiences and coping strategies for anxiety', category: 'anxiety' },
    { title: 'Academic Stress', description: 'Discuss academic pressures and burnout', category: 'academic' },
    { title: 'General Wellness', description: 'Open discussion about mental wellness', category: 'wellness' },
  ];

  for (const f of forums) {
    await Forum.findOneAndUpdate(
      { title: f.title },
      { ...f, createdBy: admin!._id },
      { upsert: true }
    );
  }

  const resources = [
    { title: 'Campus Crisis Line', description: '24/7 emergency mental health support', type: 'emergency' as const, content: 'Call: 1-800-273-8255' },
    { title: 'Mindfulness Guide', description: 'Introduction to mindfulness meditation', type: 'guide' as const, content: 'Practice 5 minutes of focused breathing daily...' },
    { title: 'Managing Exam Stress', description: 'Strategies for exam period wellness', type: 'article' as const, content: 'Plan study breaks, maintain sleep schedule...' },
  ];

  for (const r of resources) {
    await Resource.findOneAndUpdate(
      { title: r.title },
      { ...r, createdBy: admin!._id, tags: ['wellness'], isPublished: true },
      { upsert: true }
    );
  }

  // Do not create demo appointments tied to seeded counsellors.
  // Keep creating a sample assessment for the demo student so admins/counsellors can test review flows after real counsellors sign up.
  const student = await User.findOne({ email: 'student@university.edu' });
  if (student) {
    const assessment = await Assessment.findOneAndUpdate(
      { userId: student._id, type: 'phq9', score: 16 },
      {
        userId: student._id,
        type: 'phq9',
        answers: [2, 2, 2, 2, 2, 2, 2, 2, 2],
        score: 16,
        riskLevel: 'high',
        recommendations: [
          'Your assessment suggests a higher risk level.',
          'A counsellor review is recommended.',
          'Consider booking a session through the appointments page.',
        ],
        isAnonymous: false,
      },
      { upsert: true, new: true }
    );

    if (assessment) {
      await Alert.findOneAndUpdate(
        { type: 'assessment', userId: student._id, assessmentId: assessment._id },
        {
          type: 'assessment',
          riskLevel: 'high',
          message: 'PHQ-9 assessment indicates high risk and requires counsellor review.',
          userId: student._id,
          assessmentId: assessment._id,
          isResolved: false,
        },
        { upsert: true, new: true }
      );
    }
  }

  console.log('Seed completed. Demo accounts:');
  console.log('  admin@university.edu / Password123!');
  console.log('  admin2@university.edu / Password123!');
  console.log('  student@university.edu / Password123!');
  process.exit(0);
};

seed().catch(console.error);
