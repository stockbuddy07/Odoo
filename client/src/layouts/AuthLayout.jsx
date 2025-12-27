// Auth Layout for Login/Register pages
import React from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center">
            <WrenchScrewdriverIcon className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            GearGuard ERP
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The Ultimate Maintenance Tracker
          </p>
        </div>

        {/* Auth Form */}
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 GearGuard ERP. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
