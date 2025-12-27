-- GearGuard ERP - Complete Database Schema
-- This creates all tables with proper relationships for the ERP system

-- Create database
CREATE DATABASE IF NOT EXISTS gearguard_erp;
USE gearguard_erp;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS equipment;
DROP TABLE IF EXISTS maintenance_teams;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create roles table first (referenced by users)
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create maintenance_teams table
CREATE TABLE maintenance_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create team_members table (junction table for users and teams)
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    is_lead BOOLEAN DEFAULT FALSE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_team_user (team_id, user_id)
);

-- Create equipment table
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(50) NOT NULL,
    assigned_employee VARCHAR(100),
    purchase_date DATE NOT NULL,
    warranty_end DATE,
    location VARCHAR(100) NOT NULL,
    maintenance_team_id INT NOT NULL,
    is_scrapped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (maintenance_team_id) REFERENCES maintenance_teams(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create maintenance_requests table (core ERP transaction table)
CREATE TABLE maintenance_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    equipment_id INT NOT NULL,
    team_id INT NOT NULL,
    technician_id INT NULL,
    type ENUM('Corrective', 'Preventive') NOT NULL DEFAULT 'Corrective',
    status ENUM('New', 'In Progress', 'Repaired', 'Scrap') DEFAULT 'New',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    scheduled_date DATE NULL,
    completed_date DATE NULL,
    duration_hours DECIMAL(5,2) NULL,
    cost DECIMAL(10,2) NULL DEFAULT 0.00,
    notes TEXT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create maintenance_logs table (audit trail)
CREATE TABLE maintenance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    old_value VARCHAR(255) NULL,
    new_value VARCHAR(255) NULL,
    performed_by INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
CREATE INDEX idx_equipment_department ON equipment(department);
CREATE INDEX idx_equipment_scrapped ON equipment(is_scrapped);

CREATE INDEX idx_requests_equipment ON maintenance_requests(equipment_id);
CREATE INDEX idx_requests_team ON maintenance_requests(team_id);
CREATE INDEX idx_requests_technician ON maintenance_requests(technician_id);
CREATE INDEX idx_requests_status ON maintenance_requests(status);
CREATE INDEX idx_requests_type ON maintenance_requests(type);
CREATE INDEX idx_requests_created_by ON maintenance_requests(created_by);
CREATE INDEX idx_requests_created_at ON maintenance_requests(created_at);

CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

CREATE INDEX idx_logs_request ON maintenance_logs(request_id);
CREATE INDEX idx_logs_timestamp ON maintenance_logs(timestamp);

-- Create views for common queries
CREATE VIEW equipment_with_team AS
SELECT 
    e.*,
    mt.team_name,
    COALESCE(open_requests.request_count, 0) as open_requests_count
FROM equipment e
LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
LEFT JOIN (
    SELECT 
        equipment_id,
        COUNT(*) as request_count
    FROM maintenance_requests 
    WHERE status NOT IN ('Repaired', 'Scrap')
    GROUP BY equipment_id
) open_requests ON e.id = open_requests.equipment_id;

CREATE VIEW maintenance_requests_detailed AS
SELECT 
    mr.*,
    e.name as equipment_name,
    e.serial_number as equipment_serial,
    e.department as equipment_department,
    e.location as equipment_location,
    mt.team_name,
    creator.name as created_by_name,
    creator.email as created_by_email,
    tech.name as technician_name,
    tech.email as technician_email,
    CASE 
        WHEN mr.type = 'Preventive' 
        AND mr.scheduled_date < CURDATE() 
        AND mr.status != 'Repaired' 
        THEN true 
        ELSE false 
    END as is_overdue
FROM maintenance_requests mr
LEFT JOIN equipment e ON mr.equipment_id = e.id
LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
LEFT JOIN users creator ON mr.created_by = creator.id
LEFT JOIN users tech ON mr.technician_id = tech.id;

-- Display success message
SELECT 'GearGuard ERP Database Schema Created Successfully!' as message;
