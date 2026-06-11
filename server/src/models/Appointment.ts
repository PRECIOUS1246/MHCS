import mongoose, { Document, Schema } from 'mongoose';
import { AppointmentStatus } from '../types';

export interface IAppointment extends Document {
  studentId: mongoose.Types.ObjectId;
  counsellorId: mongoose.Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  sessionNotes?: string;
  rejectionReason?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    counsellorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
    },
    reason: { type: String, maxlength: 1000 },
    notes: { type: String, maxlength: 2000 },
    sessionNotes: { type: String, maxlength: 5000, select: false },
    rejectionReason: { type: String },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

appointmentSchema.index({ counsellorId: 1, scheduledAt: 1 });
appointmentSchema.index({ studentId: 1, scheduledAt: -1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
