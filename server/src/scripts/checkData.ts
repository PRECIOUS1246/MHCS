import { connectDatabase } from '../config/database';
import { Appointment, Assessment, User } from '../models';

const run = async () => {
  await connectDatabase();
  const counsellor = await User.findOne({ email: 'counsellor@university.edu' });
  console.log('counsellor', counsellor?._id?.toString());
  const pending = await Appointment.find({ status: 'pending' }).populate('studentId', 'firstName lastName');
  console.log('pending appointments', pending.map((a) => ({
    id: a._id.toString(),
    counsellorId: a.counsellorId.toString(),
    status: a.status,
    student: (a.studentId as any)?.firstName + ' ' + (a.studentId as any)?.lastName,
  })));
  const assessments = await Assessment.find({ riskLevel: { $in: ['high', 'critical'] }, isAnonymous: false }).populate('userId', 'firstName lastName email studentId');
  console.log('high/critical assessments', assessments.map((a) => ({
    id: a._id.toString(),
    risk: a.riskLevel,
    user: a.userId,
  })));
  process.exit(0);
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
