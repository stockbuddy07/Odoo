-- GearGuard ERP - Sample Data for Testing
-- This populates the database with realistic test data

USE gearguard_erp;

-- Insert roles
INSERT INTO roles (name, description) VALUES
('Admin', 'System Administrator with full access'),
('Manager', 'Maintenance Manager who can assign tasks and view reports'),
('Technician', 'Technical staff who can update maintenance status'),
('User', 'Regular user who can create maintenance requests');

-- Insert users with hashed passwords (password: 'password123' for all)
-- Note: In production, these would be properly hashed
INSERT INTO users (name, email, password_hash, role_id, is_active) VALUES
('System Administrator', 'admin@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 1, TRUE),
('John Smith', 'john.smith@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 2, TRUE),
('Mike Johnson', 'mike.johnson@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 3, TRUE),
('Sarah Wilson', 'sarah.wilson@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 3, TRUE),
('David Brown', 'david.brown@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 3, TRUE),
('Lisa Davis', 'lisa.davis@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 4, TRUE),
('Tom Anderson', 'tom.anderson@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 4, TRUE),
('Emma Taylor', 'emma.taylor@gearguard.com', '$2b$10$rOzK8Y4KpT5j5j5j5j5j5uO2b5z1P2M3N4O5P6Q7R8S9T0U1V2W3X4', 4, TRUE);

-- Insert maintenance teams
INSERT INTO maintenance_teams (team_name, description) VALUES
('Mechanical Team', 'Handles mechanical equipment repairs and maintenance'),
('Electrical Team', 'Manages electrical systems and power equipment'),
('IT Support Team', 'Computer and network maintenance specialists'),
('HVAC Team', 'Heating, ventilation, and air conditioning systems'),
('General Maintenance', 'General facility maintenance and repairs');

-- Insert team members
INSERT INTO team_members (team_id, user_id, is_lead) VALUES
-- Mechanical Team
(1, 3, TRUE),   -- Mike Johnson -> Mechanical Team Lead
(1, 5, FALSE),  -- David Brown -> Mechanical Team
-- Electrical Team  
(2, 4, TRUE),   -- Sarah Wilson -> Electrical Team Lead
(2, 3, FALSE),  -- Mike Johnson -> Electrical Team (dual role)
-- IT Support Team
(3, 5, TRUE),   -- David Brown -> IT Support Team Lead
(3, 4, FALSE),  -- Sarah Wilson -> IT Support Team (dual role)
-- HVAC Team
(4, 3, FALSE),  -- Mike Johnson -> HVAC Team
(4, 4, FALSE),  -- Sarah Wilson -> HVAC Team (dual role)
-- General Maintenance
(5, 3, FALSE),  -- Mike Johnson -> General Maintenance
(5, 4, FALSE),  -- Sarah Wilson -> General Maintenance
(5, 5, FALSE);  -- David Brown -> General Maintenance

-- Insert equipment
INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_end, location, maintenance_team_id, is_scrapped) VALUES
-- Production Equipment
('CNC Machine Model X200', 'CNC-001-2023', 'Production', 'Tom Anderson', '2023-01-15', '2026-01-15', 'Plant 1 - Line A', 1, FALSE),
('Hydraulic Press HP-500', 'HYP-002-2022', 'Production', 'Tom Anderson', '2022-03-20', '2025-03-20', 'Plant 1 - Line B', 1, FALSE),
('Assembly Line Conveyor', 'ALC-003-2021', 'Production', 'Lisa Davis', '2021-06-10', '2024-06-10', 'Plant 2 - Assembly', 1, FALSE),

-- Office Equipment
('Office Printer HP LaserJet Pro', 'PR-102-2022', 'Administration', 'Lisa Davis', '2022-05-20', '2025-05-20', 'Office Floor 2 - Room 201', 3, FALSE),
('Office Printer Canon Maxify', 'PR-103-2023', 'Administration', 'Emma Taylor', '2023-02-14', '2026-02-14', 'Office Floor 1 - Room 105', 3, FALSE),
('Photocopier Xerox WorkCentre', 'PC-104-2022', 'Administration', 'Lisa Davis', '2022-08-30', '2025-08-30', 'Office Floor 3 - Copy Room', 3, FALSE),

-- Power Equipment
('Backup Generator 500KW', 'GEN-778-2021', 'Power Management', 'Tom Anderson', '2021-03-10', '2024-03-10', 'Basement Power Room', 2, FALSE),
('UPS System 100KVA', 'UPS-779-2023', 'IT Infrastructure', 'Emma Taylor', '2023-04-05', '2026-04-05', 'Server Room A', 2, FALSE),
('Transformer TR-2000', 'TR-780-2020', 'Power Management', 'Tom Anderson', '2020-11-15', '2023-11-15', 'Electrical Room B', 2, FALSE),

-- HVAC Equipment
('Server Room AC Unit 15Ton', 'HVAC-445-2022', 'IT Infrastructure', 'Emma Taylor', '2022-08-05', '2025-08-05', 'Server Room B', 4, FALSE),
('Chiller Unit CH-100', 'CH-446-2021', 'Facilities', 'Lisa Davis', '2021-12-01', '2024-12-01', 'Roof - Chiller Area', 4, FALSE),
('Boiler System BS-500', 'BS-447-2020', 'Facilities', 'Tom Anderson', '2020-09-20', '2023-09-20', 'Basement Boiler Room', 4, FALSE),

-- IT Equipment
('Dell PowerEdge R740 Server', 'SRV-001-2023', 'IT Infrastructure', 'Emma Taylor', '2023-01-10', '2026-01-10', 'Server Room A - Rack 1', 3, FALSE),
('Network Switch Cisco Catalyst', 'SW-002-2022', 'IT Infrastructure', 'Emma Taylor', '2022-07-15', '2025-07-15', 'Server Room A - Network Closet', 3, FALSE),
('Firewall FortiGate 200F', 'FW-003-2023', 'IT Infrastructure', 'Emma Taylor', '2023-05-20', '2026-05-20', 'Server Room A - Security Rack', 3, FALSE);

-- Insert maintenance requests
INSERT INTO maintenance_requests (subject, description, equipment_id, team_id, technician_id, type, status, priority, scheduled_date, completed_date, duration_hours, cost, notes, created_by, created_at) VALUES
-- Corrective Maintenance Requests (Breakdowns)
('Hydraulic Oil Leakage', 'CNC machine showing hydraulic oil leak from main cylinder seal. Machine currently operational but leak rate increasing.', 1, 1, 3, 'Corrective', 'In Progress', 'High', NULL, NULL, NULL, NULL, 'Customer reported increased oil consumption. Requires immediate attention.', 6, '2024-01-15 09:30:00'),
('Printer Paper Jam Issue', 'HP LaserJet showing repeated paper jam errors. Multiple attempts to clear jam unsuccessful.', 4, 3, 5, 'Corrective', 'New', 'Medium', NULL, NULL, NULL, NULL, 'User unable to print documents. Affecting daily operations.', 7, '2024-01-15 14:20:00'),
('Generator Noise Analysis', 'Backup generator making unusual grinding noise during startup sequence. Started last week.', 7, 2, 4, 'Corrective', 'Repaired', 'Medium', NULL, '2024-01-14 16:45:00', 3.5, 250.00, 'Replaced worn bearing assembly in generator motor. Noise resolved.', 6, '2024-01-12 08:15:00'),
('Server Room Temperature High', 'AC unit not maintaining target temperature. Server room showing 28°C instead of 22°C.', 11, 4, NULL, 'Corrective', 'New', 'High', NULL, NULL, NULL, NULL, 'Critical for server operations. Immediate attention required.', 8, '2024-01-15 11:00:00'),

-- Preventive Maintenance Requests (Scheduled)
('Quarterly Printer Service', 'Scheduled preventive maintenance for office printer including cleaning and calibration.', 4, 3, NULL, 'Preventive', 'Scheduled', 'Low', '2024-01-25', NULL, NULL, NULL, 'Standard quarterly service as per maintenance schedule.', 2, '2024-01-10 10:00:00'),
('Monthly HVAC Filter Replacement', 'Monthly filter replacement for server room AC unit to maintain air quality.', 11, 4, 3, 'Preventive', 'Scheduled', 'Low', '2024-01-20', NULL, NULL, NULL, 'Routine monthly maintenance to ensure optimal performance.', 2, '2024-01-05 09:00:00'),
('Server Backup System Test', 'Monthly test of backup generator and UPS systems to ensure reliability.', 7, 2, 4, 'Preventive', 'Scheduled', 'Medium', '2024-01-22', NULL, NULL, NULL, 'Scheduled monthly testing of backup power systems.', 2, '2024-01-08 14:30:00'),
('Network Equipment Dust Cleaning', 'Quarterly cleaning of network switches and servers to prevent overheating.', 14, 3, 5, 'Preventive', 'Scheduled', 'Low', '2024-01-30', NULL, NULL, NULL, 'Preventive maintenance to ensure network reliability.', 2, '2024-01-12 16:00:00'),

-- Additional Corrective Requests
('UPS Battery Replacement', 'UPS system showing low battery warning. Battery appears to be reaching end of life.', 8, 2, 4, 'Corrective', 'In Progress', 'High', NULL, NULL, NULL, NULL, 'Critical backup power system. Replacement battery ordered.', 2, '2024-01-14 13:45:00'),
('Boiler Pressure Issue', 'Boiler system pressure dropping below normal operating range. Requires investigation.', 13, 4, NULL, 'Corrective', 'New', 'High', NULL, NULL, NULL, NULL, 'Affects heating system. Winter season priority.', 6, '2024-01-15 07:30:00'),

-- Completed Requests for History
('Photocopier Toner Replacement', 'Scheduled toner replacement for Xerox photocopier. Low toner warning activated.', 6, 3, 5, 'Preventive', 'Repaired', 'Low', '2024-01-10', '2024-01-10 15:30:00', 0.5, 45.00, 'Toner cartridge replaced. Machine functioning normally.', 2, '2024-01-09 16:00:00'),
('Conveyor Belt Adjustment', 'Assembly line conveyor running slower than normal. Belt tension adjustment needed.', 3, 1, 3, 'Corrective', 'Repaired', 'Medium', NULL, '2024-01-13 12:15:00', 2.0, 120.00, 'Belt tension adjusted. Conveyor operating at normal speed.', 7, '2024-01-13 10:00:00');

-- Insert maintenance logs
INSERT INTO maintenance_logs (request_id, action, old_value, new_value, performed_by) VALUES
-- Logs for Hydraulic Oil Leakage (Request ID 1)
(1, 'Request Created', NULL, 'New', 6),
(1, 'Status Updated', 'New', 'In Progress', 3),
(1, 'Technician Assigned', NULL, 'Mike Johnson (Mechanical Team)', 2),

-- Logs for Printer Paper Jam (Request ID 2) 
(2, 'Request Created', NULL, 'New', 7),

-- Logs for Generator Noise (Request ID 3)
(3, 'Request Created', NULL, 'New', 6),
(3, 'Status Updated', 'New', 'In Progress', 4),
(3, 'Completion Details Added', NULL, '3.5 hours, $250', 4),
(3, 'Status Updated', 'In Progress', 'Repaired', 4),

-- Logs for Server Room Temperature (Request ID 4)
(4, 'Request Created', NULL, 'New', 8),

-- Logs for UPS Battery (Request ID 9)
(9, 'Request Created', NULL, 'New', 2),
(9, 'Status Updated', 'New', 'In Progress', 4),

-- Logs for Boiler Pressure (Request ID 10)
(10, 'Request Created', NULL, 'New', 6),

-- Logs for Completed Requests
(11, 'Request Created', NULL, 'Scheduled', 2),
(11, 'Status Updated', 'Scheduled', 'Repaired', 5),
(11, 'Completion Details Added', NULL, '0.5 hours, $45', 5),

(12, 'Request Created', NULL, 'New', 7),
(12, 'Status Updated', 'New', 'In Progress', 3),
(12, 'Completion Details Added', NULL, '2.0 hours, $120', 3),
(12, 'Status Updated', 'In Progress', 'Repaired', 3);

-- Display success message and sample data summary
SELECT 
    'GearGuard ERP Sample Data Loaded Successfully!' as message,
    (SELECT COUNT(*) FROM roles) as total_roles,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM maintenance_teams) as total_teams,
    (SELECT COUNT(*) FROM team_members) as total_team_members,
    (SELECT COUNT(*) FROM equipment) as total_equipment,
    (SELECT COUNT(*) FROM maintenance_requests) as total_requests,
    (SELECT COUNT(*) FROM maintenance_logs) as total_logs;
