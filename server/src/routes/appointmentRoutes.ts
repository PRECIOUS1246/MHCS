import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { appointmentBookSchema, availabilitySchema } from '../validators/schemas';

const router = Router();

router.get('/counsellors', authenticate, appointmentController.getCounsellors);
router.post('/book', authenticate, authorize('student'), validate(appointmentBookSchema), appointmentController.bookAppointment);
router.get('/student', authenticate, authorize('student'), appointmentController.getStudentAppointments);
router.get('/counsellor', authenticate, authorize('counsellor'), appointmentController.getCounsellorAppointments);
router.patch('/:id/approve', authenticate, authorize('counsellor'), appointmentController.approveAppointment);
router.patch('/:id/reject', authenticate, authorize('counsellor'), appointmentController.rejectAppointment);
router.patch('/:id/cancel', authenticate, appointmentController.cancelAppointment);
router.patch('/:id/complete', authenticate, authorize('counsellor'), appointmentController.completeAppointment);
router.post('/availability', authenticate, authorize('counsellor'), validate(availabilitySchema), appointmentController.setAvailability);
router.get('/availability/:counsellorId?', authenticate, appointmentController.getAvailability);

export default router;
