import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Heart,
  MapPin,
  Plane,
  Home,
  DollarSign,
  LayoutDashboard
} from 'lucide-react';
import { useAuthStore } from '@/services/auth';
import Button from '@/components/ui/Button';
import { NAV_ITEMS } from '@/utils/constants';
import { clsx } from 'clsx';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuthStore();

  const iconMap = {
    Home,
    LayoutDashboard,
    MapPin,
    Plane,
    Heart,
    DollarSign,
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsProfileMenuOpen(false);
  };

  const isActivePage = (href: string) => {
    if (href === '/') {
      return router.pathname === '/';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-gradient-to-r from-primary-600 to-travel-500 p-2 rounded-xl">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-travel-500 bg-clip-text text-transparent">
              WanderMind
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap];
              const isActive = isActivePage(item.href);
              const shouldShow = !('requiresAuth' in item) || !item.requiresAuth || isAuthenticated;

              if (!shouldShow) return null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-primary-600 bg-primary-50 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="bg-primary-100 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium">{user?.username}</span>
                </Button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/auth/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/auth/register')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {NAV_ITEMS.map((item) => {
                const IconComponent = iconMap[item.icon as keyof typeof iconMap];
                const isActive = isActivePage(item.href);
                const shouldShow = !('requiresAuth' in item) || !item.requiresAuth || isAuthenticated;

                if (!shouldShow) return null;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={clsx(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors',
                      isActive
                        ? 'text-primary-600 bg-primary-50 border border-primary-200'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    )}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="bg-primary-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      variant="ghost"
                      onClick={() => {
                        router.push('/auth/login');
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      fullWidth
                      variant="primary"
                      onClick={() => {
                        router.push('/auth/register');
                        setIsMenuOpen(false);
                      }}
                    >
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;