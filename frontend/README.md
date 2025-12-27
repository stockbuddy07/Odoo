# Odoo React App

A modern, responsive React application built with Vite and React Router. Features authentication, protected routes, and a clean, professional UI.

## Features

- **Modern React**: Built with React 18, Vite for lightning-fast development
- **Authentication**: Secure authentication system with protected routes
- **Responsive Design**: Mobile-first responsive design that works on all devices
- **Fast Performance**: Optimized build with Vite, code splitting, and modern JavaScript
- **Clean UI**: Professional design with Lucide React icons

## Tech Stack

- React 18
- Vite (build tool)
- React Router DOM (routing)
- Axios (HTTP client)
- Lucide React (icons)
- CSS3 (styling)

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd odoo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
odoo/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Layout.css
│   │   ├── ProtectedRoute.jsx
│   │   └── ProtectedRoute.css
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Home.css
│   │   ├── Login.jsx
│   │   ├── Login.css
│   │   ├── Register.jsx
│   │   ├── Register.css
│   │   ├── Dashboard.jsx
│   │   ├── Dashboard.css
│   │   ├── Profile.jsx
│   │   └── Profile.css
│   ├── services/         # API services
│   │   └── api.js
│   ├── App.jsx           # Main app component
│   ├── App.css
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
├── .gitignore
├── index.html            # HTML template
├── package.json
├── vite.config.js        # Vite configuration
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Odoo React App
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=development
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Features Overview

### Authentication
- User registration and login
- Protected routes
- JWT token handling
- Session management

### Pages
- **Home**: Landing page with features and call-to-action
- **Login**: User authentication
- **Register**: User registration
- **Dashboard**: Protected dashboard with analytics
- **Profile**: User profile management

### Components
- **Layout**: Main application layout with navigation
- **ProtectedRoute**: Route protection for authenticated users

## API Integration

The app is configured to integrate with a backend API. Update the `VITE_API_URL` environment variable to point to your backend server.

## Development

### Code Style
- Uses ESLint for code linting
- Follows React best practices
- Consistent naming conventions

### State Management
- Uses React Context for authentication state
- Local state with useState and useEffect hooks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
