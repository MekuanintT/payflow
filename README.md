<div align="center">

<img src="https://img.shields.io/badge/PayFlow-HR%20%26%20Payroll-10b981?style=for-the-badge" alt="PayFlow">

# PayFlow
### Enterprise HR & Payroll Management System

*Built for modern businesses — streamline your workforce, automate your payroll.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Express](https://img.shields.io/badge/Express.js-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

</div>

---

## 📌 Overview

**PayFlow** is a full-stack HR and payroll management platform designed for Ethiopian businesses. It provides a complete suite of tools to manage employees, track attendance, handle leave requests, and automate monthly payroll — all from a clean, modern dashboard.

> Built with a dark-themed UI using React + shadcn/ui on the frontend and a RESTful Node.js/Express API backed by PostgreSQL.

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| 🔐 **Authentication** | JWT login, role-based access control (Super Admin, HR Manager, Employee) |
| 👥 **Employees** | Full CRUD — add, view, edit profiles, manage salary & allowances |
| 🏢 **Departments** | Create and organize company departments |
| 📅 **Attendance** | Daily check-in/check-out, status tracking (Present, Absent, Late, Half Day) |
| 🌴 **Leaves** | Submit requests, approve/reject workflow, leave type support (Annual, Sick, Unpaid, Maternity) |
| 💰 **Payroll** | Auto-generate payroll for all employees, approve → mark as paid pipeline |
| 📊 **Reports** | Payroll summaries and attendance reports |
| 🔔 **Notifications** | Real-time toast notifications on all actions |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite** — fast, modern UI framework
- **Tailwind CSS** + **shadcn/ui** — accessible, dark-themed component library
- **React Router v7** — client-side routing
- **Axios** — HTTP client with interceptors
- **Sonner** — toast notification system
- **Lucide React** — icon library

### Backend
- **Node.js** + **Express.js** — RESTful API server
- **PostgreSQL** — relational database
- **JWT** — stateless authentication
- **bcryptjs** — password hashing
- **Multer** — file upload handling
- **PDFKit** — payslip PDF generation
- **Nodemailer** — email notifications

---

## 🗂️ Project Structure

```
payflow/
├── Backend/
│   ├── config/
│   │   └── db.js                  # PostgreSQL connection pool
│   ├── controllers/               # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   ├── department.controller.js
│   │   ├── attendance.controller.js
│   │   ├── leave.controller.js
│   │   ├── payroll.controller.js
│   │   └── report.controller.js
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & role guards
│   │   └── upload.js              # Multer file upload
│   ├── models/                    # Raw SQL query functions
│   ├── routes/                    # Express route definitions
│   ├── utils/
│   │   ├── calculateSalary.js     # Payroll calculation logic
│   │   ├── generatePayslip.js     # PDF payslip generator
│   │   └── mailer.js              # Email notification helper
│   └── server.js                  # App entry point
│
└── Frontend/
    └── src/
        ├── api/                   # Axios API layer
        ├── components/
        │   ├── layout/            # Sidebar, DashboardLayout
        │   └── ui/                # shadcn/ui components
        ├── context/               # AuthContext (global auth state)
        ├── pages/
        │   ├── Dashboard/
        │   ├── Employees/
        │   ├── Departments/
        │   ├── Attendance/
        │   ├── Leaves/
        │   └── Payroll/
        └── routes/
            └── ProtectedRoute.jsx
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** v9 or higher

### 1. Clone the Repository

```bash
git clone https://github.com/MekuanintT/payflow.git
cd payflow
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE payflow;
```

Then run your schema migrations to create all tables (`users`, `employees`, `departments`, `salaries`, `attendance`, `leaves`, `payroll_records`).

### 3. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=payflow
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Start the backend:

```bash
node server.js
```

You should see:
```
✅ Connected to PayFlow PostgreSQL database.
🚀 PayFlow server running on port 5000
```

### 4. Frontend Setup

```bash
cd ../Frontend
npm install
```

Create a `.env` file in the `Frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Default Login

```
Email:    admin@payflow.com
Password: admin123
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/login` | Login and receive JWT | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |

### Employees
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/employees` | List all employees | ✅ |
| `POST` | `/api/employees` | Create employee | ✅ Admin |
| `GET` | `/api/employees/:id` | Get single employee | ✅ |
| `PUT` | `/api/employees/:id` | Update employee | ✅ Admin |
| `PUT` | `/api/employees/:id/salary` | Update salary | ✅ Admin |
| `DELETE` | `/api/employees/:id` | Delete employee | ✅ Admin |

### Attendance
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/attendance` | List records | ✅ |
| `POST` | `/api/attendance/check-in` | Check in | ✅ |
| `POST` | `/api/attendance/check-out` | Check out | ✅ |

### Leaves
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/leaves` | List requests | ✅ |
| `POST` | `/api/leaves` | Submit request | ✅ |
| `PUT` | `/api/leaves/:id/approve` | Approve | ✅ Admin |
| `PUT` | `/api/leaves/:id/reject` | Reject | ✅ Admin |

### Payroll
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/payroll` | List records | ✅ |
| `POST` | `/api/payroll/generate` | Generate for one employee | ✅ Admin |
| `POST` | `/api/payroll/generate-all` | Generate for all employees | ✅ Admin |
| `PUT` | `/api/payroll/:id/approve` | Approve payroll | ✅ Admin |
| `PUT` | `/api/payroll/:id/paid` | Mark as paid | ✅ Admin |

---

## 🔐 Role-Based Access

| Feature | Super Admin | HR Manager | Employee |
|---------|-------------|------------|----------|
| View Dashboard | ✅ | ✅ | ✅ |
| Manage Employees | ✅ | ✅ | ❌ |
| Manage Departments | ✅ | ✅ | ❌ |
| Approve Leaves | ✅ | ✅ | ❌ |
| Generate Payroll | ✅ | ❌ | ❌ |
| Approve Payroll | ✅ | ❌ | ❌ |
| View Own Payslip | ✅ | ✅ | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 👤 Author

**Mekuanint Tewende**  
- GitHub: [@MekuanintT](https://github.com/MekuanintT)
- Project: [PayFlow](https://github.com/MekuanintT/payflow)
---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ using React, Node.js, and PostgreSQL</sub>
</div>
