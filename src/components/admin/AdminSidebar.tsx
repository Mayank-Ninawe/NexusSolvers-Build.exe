'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  FileText,
  BarChart3,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
      color: 'text-accent-cyan',
    },
    {
      icon: Building2,
      label: 'Colleges',
      href: '/admin/colleges',
      color: 'text-accent-green',
    },
    {
      icon: FileText,
      label: 'Reports',
      href: '/admin/reports',
      color: 'text-accent-pink',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/admin/analytics',
      color: 'text-purple-400',
    },
    {
      icon: Users,
      label: 'Users',
      href: '/admin/users',
      color: 'text-blue-400',
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/admin/settings',
      color: 'text-yellow-400',
    },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] glass-effect border-r border-white/10 backdrop-blur-xl z-40"
    >
      <div className="p-4">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/5 transition-colors mb-6"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 px-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-pink flex items-center justify-center flex-shrink-0">
            <Shield className="h-6 w-6 text-white" />
          </div>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black text-lg gradient-text"
            >
              Admin Panel
            </motion.div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-pink/20 border border-accent-cyan/30'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive ? item.color : 'text-gray-400'
                    }`}
                  />
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`font-semibold ${
                        isActive ? 'text-white' : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
}
