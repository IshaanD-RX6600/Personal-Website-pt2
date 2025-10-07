"use client";

import SimpleDock from '@/components/SimpleDock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear, VscCode, VscBook } from 'react-icons/vsc';

export default function BlogNavigationDock() {
  const handleNavigation = (path: string) => { try { window.location.href = path; } catch { window.location.assign(path); } };
  
  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => handleNavigation('/') },
    { icon: <VscCode size={18} />, label: 'Projects', onClick: () => handleNavigation('/projects') },
    { icon: <VscBook size={18} />, label: 'Blog', onClick: () => handleNavigation('/blog') },
    { icon: <VscAccount size={18} />, label: 'About', onClick: () => handleNavigation('/about') },
    { icon: <VscArchive size={18} />, label: 'Resume', onClick: () => alert('Resume!') },
    { icon: <VscSettingsGear size={18} />, label: 'Contact', onClick: () => alert('Contact!') },
  ];

  return <SimpleDock items={dockItems} />;
}
