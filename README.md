# School Management Portal

A comprehensive school management system built with Next.js, TypeScript, and MongoDB. This portal provides separate dashboards for administrators and teachers to manage various school operations efficiently.

## 🎯 Features

### Admin Dashboard
- **Student Management**: Add, edit, view, and manage student records
- **Teacher Management**: Handle teacher profiles, assignments, and roles  
- **Class Management**: Organize classes and student assignments
- **Fee Management**: Track and manage student fee payments
- **Examination System**: Create and manage exams and assessments
- **Notice Board**: Post and manage school notices and announcements
- **Timetable Management**: Create and manage class schedules
- **Attendance Tracking**: Monitor student attendance across classes

### Teacher Dashboard
- **Attendance Marking**: Mark student attendance for assigned classes
- **Marks Entry**: Enter and manage student marks and grades
- **Results Management**: View and submit student results
- **Timetable View**: Access teaching schedules and class timings
- **Notice Access**: View school notices and announcements

### Authentication & Security
- Role-based access control (Admin/Teacher)
- Secure login system with session management
- Route protection and authorization middleware
- Data validation and error handling

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Custom authentication system
- **State Management**: React Context API
- **UI Components**: Comprehensive component library with dark/light themes

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sarahkamdar/School_Portal.git
   cd School_Portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Ensure MongoDB is running
   - The application will create the necessary collections automatically
   - Use the `/api/seed` endpoint to populate initial data if needed

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
school-portal/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── teacher/           # Teacher dashboard pages  
│   ├── api/               # API routes and endpoints
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/                # UI component library
│   ├── auth-provider.tsx  # Authentication context
│   ├── sidebar.tsx        # Navigation sidebar
│   └── topbar.tsx         # Top navigation
├── lib/                   # Utility functions and configurations
│   ├── mongodb.ts         # Database connection
│   ├── types.ts           # TypeScript type definitions
│   ├── data.ts            # Data utilities
│   └── utils.ts           # Helper functions
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── styles/               # Global styles
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth` - User authentication

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get specific student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Teachers  
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create new teacher
- `GET /api/teachers/[id]` - Get specific teacher
- `PUT /api/teachers/[id]` - Update teacher

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/[id]` - Get specific class

### Additional endpoints for attendance, fees, exams, notices, and timetable management.

## 🎨 UI Components

The project uses a comprehensive UI component library including:
- Forms and inputs with validation
- Data tables with sorting and pagination  
- Modal dialogs and alerts
- Navigation and layout components
- Charts and data visualization
- Dark/light theme support

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF token implementation
- Secure session management
- Role-based access control

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Development Guidelines

1. Follow TypeScript best practices
2. Use the existing component patterns
3. Implement proper error handling
4. Add appropriate validation
5. Write clean, documented code

## 📋 Database Schema

The application uses MongoDB with the following main collections:
- **students** - Student records and information
- **teachers** - Teacher profiles and assignments  
- **classes** - Class definitions and student assignments
- **attendance** - Attendance tracking records
- **fees** - Fee management and payment records
- **exams** - Examination and assessment data
- **notices** - School notices and announcements
- **timetables** - Class schedules and timings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## 🔄 Updates and Roadmap

### Completed Features ✅
- Core infrastructure and setup
- Authentication and authorization system
- Admin dashboard with full CRUD operations
- Teacher dashboard with essential features
- Complete API architecture
- Responsive UI with dark/light themes

### Future Enhancements 🚧
- Student portal for self-service features
- Parent portal for monitoring student progress
- Mobile application for iOS/Android
- Advanced reporting and analytics
- Integration with external payment gateways
- Email/SMS notification system
- Multi-language support

---

Built with ❤️ for educational institutions to streamline school management operations.