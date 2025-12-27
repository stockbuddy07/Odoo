# 📘 GEARGUARD ERP - The Ultimate Maintenance Tracker

## *MERN Stack + MySQL | ERP-Style Module*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8+-orange.svg)](https://www.mysql.com/)

**GearGuard ERP** is a comprehensive Enterprise Resource Planning (ERP) maintenance module built with modern web technologies. It helps companies track equipment, manage maintenance teams, handle maintenance requests, and visualize workflows through Kanban boards and calendar views.

## 🎯 Features

### 🏭 Equipment Management
- **Asset Tracking**: Register and manage all company equipment
- **Team Assignment**: Automatically assign equipment to maintenance teams
- **Status Monitoring**: Track equipment health and warranty status
- **Location Management**: Organize equipment by departments and locations

### 👥 Team Management
- **Specialized Teams**: Create teams for Mechanical, Electrical, IT, HVAC, etc.
- **Member Assignment**: Assign technicians to teams with lead roles
- **Skill-based Organization**: Organize teams based on expertise
- **Team Performance**: Monitor team workload and efficiency

### 🛠️ Maintenance Workflow
- **Corrective Maintenance**: Handle breakdown repairs with priority levels
- **Preventive Maintenance**: Schedule routine maintenance with calendar integration
- **Request Tracking**: Complete lifecycle from creation to completion
- **Status Management**: New → In Progress → Repaired/Scrap workflow

### 📊 Visual Management
- **Kanban Board**: Drag-and-drop workflow management
- **Calendar View**: Preventive maintenance scheduling
- **Dashboard**: Real-time overview and statistics
- **Reports**: Performance analytics and trends

### 🔐 Security & Access Control
- **Role-based Access**: Admin, Manager, Technician, User roles
- **JWT Authentication**: Secure token-based authentication
- **Permission System**: Granular access control per feature
- **Audit Trail**: Complete activity logging

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React DnD** - Drag and drop functionality
- **React Hot Toast** - Notification system
- **Heroicons** - Beautiful SVG icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL 8** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware

### Development Tools
- **Concurrently** - Run multiple npm scripts
- **Nodemon** - Auto-restart for development
- **MySQL2** - MySQL driver for Node.js

## 📁 Project Structure

```
gearguard-erp/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── kanban/         # Kanban board components
│   │   │   ├── calendar/       # Calendar view components
│   │   │   └── common/         # Shared components
│   │   ├── layouts/            # Application layouts
│   │   ├── modules/            # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   ├── equipment/      # Equipment management
│   │   │   ├── maintenance/    # Maintenance requests
│   │   │   ├── teams/          # Team management
│   │   │   └── users/          # User management
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── context/            # React contexts
│   │   └── utils/              # Utility functions
│   ├── package.json
│   └── vite.config.js
├── server/                     # Node.js Backend
│   ├── config/                 # Configuration files
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── equipment/          # Equipment APIs
│   │   ├── maintenance/        # Maintenance APIs
│   │   ├── teams/              # Team APIs
│   │   └── users/              # User APIs
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Utility functions
│   ├── app.js                  # Express app setup
│   └── server.js               # Server entry point
├── database/                   # MySQL Database
│   ├── schema.sql              # Database schema
│   ├── seed.sql                # Sample data
│   └── relations.sql           # Foreign key relationships
├── docs/                       # Documentation
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MySQL 8+** - [Download](https://www.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/gearguard-erp.git
   cd gearguard-erp
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Setup database**
   ```bash
   # Create database
   mysql -u root -p -e "CREATE DATABASE gearguard_erp;"
   
   # Import schema
   mysql -u root -p gearguard_erp < database/schema.sql
   
   # Import sample data
   mysql -u root -p gearguard_erp < database/seed.sql
   ```

4. **Configure environment variables**
   ```bash
   # Server configuration
   cp server/.env.example server/.env
   # Edit server/.env with your database credentials
   
   # Client configuration (optional)
   cp client/.env.example client/.env
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 👤 Default Login Credentials

After importing the sample data, you can login with these accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Admin** | admin@gearguard.com | password123 | Full system access |
| **Manager** | john.smith@gearguard.com | password123 | Can manage teams and equipment |
| **Technician** | mike.johnson@gearguard.com | password123 | Can update assigned requests |
| **User** | lisa.davis@gearguard.com | password123 | Can create maintenance requests |

## 📖 Usage Guide

### 1. Equipment Management
- **Add Equipment**: Navigate to Equipment → Add New Equipment
- **Assign Teams**: Equipment is automatically assigned to maintenance teams
- **Track Status**: Monitor equipment health and maintenance history

### 2. Maintenance Requests
- **Create Request**: Select equipment and describe the issue
- **Automatic Assignment**: System assigns requests to appropriate teams
- **Status Updates**: Track progress through Kanban board
- **Completion**: Mark requests as repaired or scrapped

### 3. Kanban Board
- **Drag & Drop**: Move requests between columns to update status
- **Role Permissions**: Technicians can only update assigned requests
- **Filtering**: Filter by priority, team, or date range

### 4. Calendar View
- **Preventive Maintenance**: Schedule routine maintenance
- **Overdue Tracking**: Visual indicators for past-due items
- **Team Planning**: View team workload and capacity

### 5. Team Management
- **Create Teams**: Organize technicians by specialization
- **Member Assignment**: Add team members and assign leads
- **Equipment Assignment**: Teams handle specific equipment types

## 🔧 API Documentation

### Authentication
```
POST /api/auth/login      # User login
POST /api/auth/register   # User registration
GET  /api/auth/profile    # Get user profile
POST /api/auth/logout     # User logout
```

### Equipment
```
GET    /api/equipment           # List equipment
POST   /api/equipment           # Create equipment
GET    /api/equipment/:id       # Get equipment details
PUT    /api/equipment/:id       # Update equipment
DELETE /api/equipment/:id       # Delete equipment
```

### Maintenance
```
GET  /api/maintenance              # List requests
POST /api/maintenance              # Create request
PUT  /api/maintenance/:id/status   # Update status
GET  /api/maintenance/kanban       # Get Kanban data
GET  /api/maintenance/calendar     # Get calendar data
```

### Teams
```
GET  /api/teams            # List teams
POST /api/teams            # Create team
PUT  /api/teams/:id        # Update team
DELETE /api/teams/:id      # Delete team
```

## 🏗️ Database Schema

### Core Tables
- **users** - System users with authentication
- **roles** - User permission levels (Admin, Manager, Technician, User)
- **equipment** - Company assets and equipment
- **maintenance_teams** - Specialized maintenance teams
- **team_members** - User-team relationships
- **maintenance_requests** - Core ERP transaction table
- **maintenance_logs** - Audit trail for all activities

### Relationships
- Users belong to roles and can be members of multiple teams
- Equipment is assigned to maintenance teams
- Maintenance requests link equipment, teams, and technicians
- All activities are logged for audit purposes

## 🎨 Customization

### Theming
- Modify `client/src/index.css` for global styles
- Update `tailwind.config.js` for custom color schemes
- Customize component styles in individual files

### Adding Features
- Create new modules in `server/modules/`
- Add corresponding frontend components in `client/src/modules/`
- Update database schema in `database/schema.sql`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run server:test

# Run frontend tests only
npm run client:test
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build frontend
npm run client

# Start production server
npm run start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Update database credentials in `.env`
3. Set secure `JWT_SECRET`
4. Configure proper CORS origins

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Academic Information

This project is designed as a comprehensive ERP demonstration system suitable for:
- **Final Year Projects** - Complete full-stack application
- **Portfolio Projects** - Demonstrates modern development skills
- **Interview Preparation** - Real-world ERP experience
- **Learning Resource** - Modern web development best practices

## 📞 Support

For support, email support@gearguard.com or join our Discord community.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Express.js community for the robust backend framework
- Tailwind CSS for the utility-first CSS framework
- Heroicons for the beautiful icon set
- All contributors who helped make this project possible

---

**Built with ❤️ using MERN Stack + MySQL**

*GearGuard ERP - The Ultimate Maintenance Tracker*
