// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/components/Navigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; 
import { LayoutDashboard, TrendingUp, Target, User, LogOut, Menu } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth(); 

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transactions', icon: TrendingUp },
    { href: '/savings', label: 'Savings', icon: Target },
    
  ];

  const userInitials = user?.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  const DesktopNavLinks = () => (
    <div className="flex space-x-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center px-1 pt-1 border-b-4 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
  
  const MobileNavLinks = () => (
    <nav className="flex flex-col space-y-2 p-4 pt-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-3 rounded-md font-semibold transition-colors ${
              isActive
                ? 'bg-black text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <nav className="border-b-2 border-black bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center space-x-4">
            
            {/* 1. Hamburger Trigger & Sheet (Mobile Only) */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-3/4 border-r-2 border-black">
                  <h3 className="text-xl font-bold mb-4">Financial Tracker</h3>
                  <MobileNavLinks />
                  <div className="mt-6 p-4 border-t-2 border-black">
                      <Button 
                        onClick={logout}
                        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            {/* 2. Desktop Links (Desktop Only) */}
            <div className="hidden lg:flex">
              <DesktopNavLinks />
            </div>

          </div>

          {/* RIGHT SIDE: Profile & Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link href="/profile" className="hover:opacity-80 transition-opacity">
                <Avatar className="h-10 w-10 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {/* FIX 2: Konversi null menjadi undefined untuk AvatarImage src */}
                    <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                    <AvatarFallback className="bg-black text-white">
                        {userInitials}
                    </AvatarFallback>
                </Avatar>
              </Link>
            )}

            {/* Logout Button: Desktop (full text) */}
            <Button
              onClick={logout}
              variant="outline"
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all hidden lg:flex"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            {/* Logout Button: Mobile (icon) */}
            <Button
                onClick={logout}
                variant="outline"
                size="icon"
                className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all lg:hidden"
            >
                <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}