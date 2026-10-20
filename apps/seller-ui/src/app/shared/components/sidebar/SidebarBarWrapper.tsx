'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListOrdered,
  Wallet,
  SquarePlus,
  Box,
  CalendarPlus,
  Bell,
  Mail,
  Settings,
  TicketPercent,
  LogOut,
} from 'lucide-react';
import useSidebar from '@/app/hooks/useSidebar';
import { useSeller } from '@/app/hooks/useSeller';
import Logo from '@/app/configs/logo';
import SidebarItem from './sidebar.item';
import SidebarMenu from './sidebar.menu';

const SidebarBarWrapper = () => {
  const { activeSidebarItem, setActiveSidebarItem } = useSidebar();
  const pathname = usePathname();
  const { seller } = useSeller();

  console.log(seller);
  useEffect(() => {
    if (pathname) {
      setActiveSidebarItem(pathname);
    }
  }, [pathname, setActiveSidebarItem]);

  const checkIsActive = (route: string) => {
    if (route === '/dashboard') {
      return pathname === '/dashboard' || activeSidebarItem === '/dashboard';
    }
    return (
      pathname === route ||
      activeSidebarItem === route ||
      (pathname ? pathname.startsWith(route + '/') : false)
    );
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between overflow-y-auto px-3.5 py-4 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div>
        {/* Shop Header */}
        <div className="px-1 mb-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 group transition-opacity hover:opacity-90"
          >
            <Logo avatarUrl={seller?.shop?.avatar?.url} />
            <div className="flex flex-col min-w-0">
              <h3 className="text-[15px] font-semibold text-white tracking-tight leading-snug truncate">
                {seller?.shop?.name || 'Becodemy'}
              </h3>
              <p className="text-[12px] font-normal text-[#88909f] leading-tight truncate mt-0.5">
                {seller?.shop?.address || '653 Banani, Dhaka'}
              </p>
            </div>
          </Link>
        </div>

        {/* Dashboard Main Button */}
        <div className="flex flex-col gap-1">
          <SidebarItem
            href="/dashboard"
            title="Dashboard"
            icon={<LayoutDashboard className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard')}
          />
        </div>

        {/* Navigation Sections */}
        <SidebarMenu title="Main Menu">
          <SidebarItem
            title="Orders"
            href="/dashboard/orders"
            icon={<ListOrdered className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/orders')}
          />
          <SidebarItem
            title="Payments"
            href="/dashboard/payments"
            icon={<Wallet className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/payments')}
          />
        </SidebarMenu>

        <SidebarMenu title="Products">
          <SidebarItem
            title="Create Product"
            href="/dashboard/create-product"
            icon={<SquarePlus className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/create-product')}
          />
          <SidebarItem
            title="All Products"
            href="/dashboard/products"
            icon={<Box className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/products')}
          />
        </SidebarMenu>

        <SidebarMenu title="Events">
          <SidebarItem
            title="Create Event"
            href="/dashboard/create-event"
            icon={<CalendarPlus className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/create-event')}
          />
          <SidebarItem
            title="All Events"
            href="/dashboard/all-events"
            icon={<Bell className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/all-events')}
          />
        </SidebarMenu>

        <SidebarMenu title="Controllers">
          <SidebarItem
            title="Inbox"
            href="/dashboard/inbox"
            icon={<Mail className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/inbox')}
          />
          <SidebarItem
            title="Settings"
            href="/dashboard/settings"
            icon={<Settings className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/settings')}
          />
        </SidebarMenu>
        <SidebarMenu title="Extras">
          <SidebarItem
            title="Discount Codes"
            href="/dashboard/discount-codes"
            icon={<TicketPercent className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/discount-codes')}
          />
          <SidebarItem
            title="Logout"
            href="/dashboard/logout"
            icon={<LogOut className="w-[19px] h-[19px]" />}
            isActive={checkIsActive('/dashboard/logout')}
          />
        </SidebarMenu>
      </div>
    </div>
  );
};

export default SidebarBarWrapper;
