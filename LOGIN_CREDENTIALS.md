# 🔐 GEARGUARD ERP - LOGIN CREDENTIALS

## Demo User Accounts

After setting up the database with sample data, you can login with these accounts:

### 🛡️ **ADMIN ACCOUNT**
- **Email**: `admin@gearguard.com`
- **Password**: `password123`
- **Role**: System Administrator
- **Permissions**: Full system access, user management, all features

### 👔 **MANAGER ACCOUNT**
- **Email**: `john.smith@gearguard.com`
- **Password**: `password123`
- **Role**: Maintenance Manager
- **Permissions**: Manage teams, equipment, assign tasks, view reports

### 🔧 **TECHNICIAN ACCOUNT**
- **Email**: `mike.johnson@gearguard.com`
- **Password**: `password123`
- **Role**: Maintenance Technician
- **Permissions**: Update assigned requests, view Kanban board, equipment details

### 👤 **USER ACCOUNT**
- **Email**: `lisa.davis@gearguard.com`
- **Password**: `password123`
- **Role**: Regular User
- **Permissions**: Create maintenance requests, view own requests

## 🚀 How to Login

1. **Open the application** at http://localhost:3000
2. **Enter any email/password** from the list above
3. **Explore different roles** to see how permissions work
4. **Try creating maintenance requests** as different user types

## 📋 What Each Role Can Do

### Admin
- ✅ Full CRUD operations on all modules
- ✅ User management and role assignment
- ✅ System configuration
- ✅ All reports and analytics

### Manager
- ✅ Create and manage equipment
- ✅ Create and manage teams
- ✅ Assign technicians to requests
- ✅ Update any request status
- ✅ View all reports

### Technician
- ✅ View assigned requests
- ✅ Update status of assigned requests
- ✅ Use Kanban board
- ✅ View equipment details
- ✅ Access calendar view

### User
- ✅ Create maintenance requests
- ✅ View own requests
- ✅ Access equipment list
- ✅ View calendar (preventive maintenance)

## 🎯 Features to Test

1. **Dashboard**: Different views per role
2. **Equipment**: Add/edit equipment (Manager+)
3. **Maintenance Requests**: Create and track requests
4. **Kanban Board**: Drag & drop workflow (Technician+)
5. **Calendar View**: Preventive maintenance scheduling
6. **Team Management**: Organize technicians (Manager+)
7. **Reports**: Analytics and performance metrics

## 🔍 Sample Data Included

- **4 Equipment Items**: CNC machines, printers, generators
- **3 Maintenance Teams**: Mechanical, Electrical, IT Support
- **5 Maintenance Requests**: Mix of corrective and preventive
- **Audit Trail**: Complete activity logging

## 💡 Pro Tips

- **Start with Admin** to see all features
- **Try Manager** to test team assignments
- **Use Technician** to experience Kanban workflow
- **Switch roles** to see permission differences
- **Create requests** as User to test user experience
