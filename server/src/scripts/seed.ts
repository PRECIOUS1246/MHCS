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
      {
        ...u,
        password,
        isActive: true,
        isEmailVerified: true,
        anonymousNickname: `User${Math.floor(Math.random() * 9999)}`,
      },
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
    {
      title: 'Campus Crisis Line',
      description: '24/7 emergency mental health support',
      type: 'emergency' as const,
      content: 'Call: 1-800-273-8255',
      imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80',
      url: 'https://988lifeline.org/',
    },
    {
      title: 'Mindfulness Guide',
      description: 'Introduction to mindfulness meditation',
      type: 'guide' as const,
      content: 'Practice 5 minutes of focused breathing daily...',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
      videoUrl: 'https://www.youtube.com/embed/6p_yaNFSYao?si=0f5Q6R3v4c4H6g5I',
    },
    {
      title: 'Managing Exam Stress',
      description: 'Strategies for exam period wellness',
      type: 'article' as const,
      content: 'Plan study breaks, maintain sleep schedule...',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      url: 'https://www.verywellmind.com/ways-to-reduce-test-anxiety-2795360',
    },
    {
      title: 'Five-Minute Guided Meditation',
      description: 'A short guided meditation to help you pause and refocus.',
      type: 'video' as const,
      content: 'Try this brief practice during a study break.',
      videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    },
    {
      title: 'Guided Meditation for Anxiety',
      description: 'A calming guided meditation for moments of stress or anxiety.',
      type: 'video' as const,
      content: 'Pause somewhere comfortable and follow along at your own pace.',
      videoUrl: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
    },
    {
      title: 'Caring for Your Mental Health',
      description: 'Practical information on supporting your mental health and finding care.',
      type: 'article' as const,
      content: 'Read guidance from the National Institute of Mental Health.',
      imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80',
      url: 'https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health',
    },
    {
      title: 'Understanding Anxiety Disorders',
      description: 'Learn about common anxiety disorders, symptoms, and treatment options.',
      type: 'article' as const,
      content: 'An overview from the National Institute of Mental Health.',
      imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80',
      url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders',
    },
    {
      title: 'Mental Health: WHO Overview',
      description: 'An overview of mental health and global approaches to care.',
      type: 'article' as const,
      content: 'A fact sheet from the World Health Organization.',
      imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
    },
    {
      title: 'Grounding with the 5-4-3-2-1 Method',
      description: 'A step-by-step sensory grounding exercise for stressful moments.',
      type: 'guide' as const,
      content: 'Notice 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.',
      imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Build a Wind-Down Routine',
      description: 'Small, repeatable steps to make space for rest at the end of the day.',
      type: 'guide' as const,
      content: 'Choose a steady wake time, dim lights before bed, and try a quiet activity that helps you unwind.',
      imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Plan Your Study Breaks',
      description: 'A flexible focus-and-break rhythm for long study sessions.',
      type: 'strategy' as const,
      content: 'Try 25 minutes of focused work followed by a 5-minute break. After four rounds, take a longer break and adjust the timing to suit you.',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    },
    {
      title: 'Take a One-Minute Reset',
      description: 'A brief pause to settle and choose your next manageable step.',
      type: 'strategy' as const,
      content: 'Put both feet on the floor, relax your shoulders, take a few comfortable breaths, then name one small next action.',
      imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80',
    },
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
