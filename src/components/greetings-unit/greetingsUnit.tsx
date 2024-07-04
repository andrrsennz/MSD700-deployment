"use client"

import React, { useState, useEffect } from 'react';
import styles from './greetingsUnit.module.css';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  text: string;
}

const GreetingsUnit: React.FC = () => {
  // Initialize state with empty strings
  const [username, setUsername] = useState<string>('');
  const [full_name, setFull_name] = useState<string>('');
  const [unit_name, setUnit_name] = useState<string>('');

  // Update state with sessionStorage values after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(sessionStorage.getItem('username') || '');
      setFull_name(sessionStorage.getItem('full_name') || '');
      setUnit_name(sessionStorage.getItem('unit_name') || '');
    }
  }, []);

  const navLinks: NavLink[] = [
    { href: '/unit/control', text: 'Control Mode' },
    { href: '/unit/mapping', text: 'Mapping' },
    { href: '/unit/database', text: 'Database' },
  ];

  const pathname = usePathname() || '/unit/control';
  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <div
      className={`${styles.greetings} ${isActive('/unit/control') && styles.active
        } ${styles.mobileHide}`}
    >
      <img src="/icons/Icon-person-white.svg" alt="" />
      <p>{`Welcome, ${full_name} (${username}) - ${unit_name}`}</p>
    </div>
  );
};

export default GreetingsUnit;
