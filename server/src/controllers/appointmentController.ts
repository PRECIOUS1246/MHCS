import { Response, NextFunction } from 'express';
import { Appointment, User, CounsellorAvailability } from '../models';
import { AuthRequest } from '../middleware/auth';
import { AppError, NotFoundError } from '../utils/errors';
import { createNotification } from '../services/notificationService';
import { logActivity } from '../services/activityLogService';

export const bookAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { counsellorId, scheduledAt, reason, duration } = req.body;

    const counsellor = await User.findOne({ _id: counsellorId, role: 'counsellor', isActive: true });
    if (!counsellor) throw new AppError('Counsellor not found', 404);

    const scheduledDate = new Date(scheduledAt);
    const conflict = await Appointment.findOne({
      counsellorId,
      scheduledAt: scheduledDate,
      status: { $in: ['pending', 'approved'] },
    });

    if (conflict) throw new AppError('Time slot unavailable', 409);

    const appointment = await Appointment.create({
      studentId: req.user!.userId,
      counsellorId,
      scheduledAt: scheduledDate,
      reason,
      duration: duration || 60,
      status: 'pending',
    });

    await createNotification(
      counsellorId,
      'New Appointment Request',
      `A student has requested an appointment on ${scheduledDate.toLocaleDateString()}`,
      'appointment',
      { link: '/appointments', metadata: { appointmentId: appointment._id } }
    );

    await createNotification(
      req.user!.userId,
      'Appointment Requested',
      'Your appointment request has been submitted and is pending approval.',
      'appointment'
    );

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getStudentAppointments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await Appointment.find({ studentId: req.user!.userId })
      .populate('counsellorId', 'firstName lastName email department')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const getCounsellorAppointments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const appointments = await Appointment.find({ counsellorId: req.user!.userId })
      .populate('studentId', 'firstName lastName email studentId')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
};

export const approveAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new NotFoundError('Appointment not found');

    if (appointment.counsellorId.toString() !== req.user!.userId) {
      throw new AppError('Not authorized', 403);
    }

    appointment.status = 'approved';
    await appointment.save();

    await createNotification(
      appointment.studentId.toString(),
      'Appointment Approved',
      `Your appointment on ${appointment.scheduledAt.toLocaleDateString()} has been approved.`,
      'appointment'
    );

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const rejectAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new NotFoundError('Appointment not found');

    appointment.status = 'rejected';
    appointment.rejectionReason = reason;
    await appointment.save();

    await createNotification(
      appointment.studentId.toString(),
      'Appointment Declined',
      reason || 'Your appointment request was declined. Please book another slot.',
      'appointment'
    );

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new NotFoundError('Appointment not found');

    const isStudent = appointment.studentId.toString() === req.user!.userId;
    const isCounsellor = appointment.counsellorId.toString() === req.user!.userId;

    if (!isStudent && !isCounsellor) throw new AppError('Not authorized', 403);

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const completeAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id).select('+sessionNotes');
    if (!appointment) throw new NotFoundError('Appointment not found');

    appointment.status = 'completed';
    if (sessionNotes) appointment.sessionNotes = sessionNotes;
    await appointment.save();

    res.json({ success: true, data: { id: appointment._id, status: appointment.status } });
  } catch (error) {
    next(error);
  }
};

export const getCounsellors = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const counsellors = await User.find({ role: 'counsellor', isActive: true }).select(
      'firstName lastName email department avatar'
    );
    res.json({ success: true, data: counsellors });
  } catch (error) {
    next(error);
  }
};

export const setAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dayOfWeek, slots } = req.body;

    const availability = await CounsellorAvailability.findOneAndUpdate(
      { counsellorId: req.user!.userId, dayOfWeek },
      { slots, isActive: true },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const counsellorId = req.params.counsellorId || req.user!.userId;
    const availability = await CounsellorAvailability.find({
      counsellorId,
      isActive: true,
    });
    res.json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};
