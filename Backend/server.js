const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// --- Routes ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/employees',   require('./routes/employee.routes'));
app.use('/api/attendance',  require('./routes/attendance.routes'));
app.use('/api/leaves',      require('./routes/leave.routes'));
app.use('/api/payroll',     require('./routes/payroll.routes'));
app.use('/api/reports',     require('./routes/report.routes'));
app.use('/api/users',       require('./routes/user.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
// --- Start ---
app.listen(PORT, () => {
    console.log(`PayFlow server running on port ${PORT}`);
});
