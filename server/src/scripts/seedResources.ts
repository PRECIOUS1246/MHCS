import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Resource, User } from '../models';

const seedResources = async () => {
  await connectDatabase();

  try {
    const admin = await User.findOne({ role: 'admin' }).select('_id');
    if (!admin) throw new Error('An admin account is required to seed resources.');

    const resources = [
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

    for (const { title, ...fields } of resources) {
      await Resource.findOneAndUpdate(
        { title },
        { $setOnInsert: { ...fields, createdBy: admin._id, tags: ['wellness'], isPublished: true } },
        { upsert: true }
      );
    }

    console.log(`Processed ${resources.length} resource seed entries.`);
  } finally {
    await mongoose.disconnect();
  }
};

void seedResources().catch((error: unknown) => {
  console.error('Failed to seed resources:', error);
  process.exitCode = 1;
});