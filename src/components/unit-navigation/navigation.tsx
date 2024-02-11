import React from 'react'; // Import React for type annotations
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './navigation.module.css';
import Link from 'next/link';
import Image from 'next/image';

interface NavLink {
  href: string;
  text: string;
}

interface NavigationProps {
  imageSrc?: string; // optional image source
}

const Navigation: React.FC<NavigationProps> = ({ imageSrc }) => {
  const router = useRouter();
  const pathname = usePathname() || '/unit/control';
  const [username, setUsername] = useState<string>('');
  const [full_name, setFull_name] = useState<string>('');
  const [unit_name, setUnit_name] = useState<string>('');

  useEffect(() => {
    setUsername(sessionStorage.getItem('username') || '');
    setFull_name(sessionStorage.getItem('full_name') || '');
    setUnit_name(sessionStorage.getItem('unit_name') || '');
  })

  function isActive(href: string) {
    return pathname === href;
  }

  const goToControlPage = () => {
    router.push('/unit/control');
  };

  const goToMappingPage = () => {
    router.push('/unit/mapping');
  };

  const goToDatabasePage = () => {
    router.push('/unit/database');
  };

  const navLinks: NavLink[] = [
    { href: '/unit/control', text: 'Control Mode' },
    { href: '/unit/mapping', text: 'Mapping' },
    { href: '/unit/database', text: 'Database' },
  ];

  return (
    <>
      <div className={`${styles.sideSection}`}>
        <div
          className={`${styles.greetings} ${isActive('/unit/control') && styles.active
            }`}
        >
          <img src="/icons/Icon-person-white.svg" alt="" />
          <p>{`Welcome, ${full_name} (${username}) - ${unit_name}`}</p>
        </div>
        <div className={styles.menu}>
          <div
            className={`${styles.controlMode} ${isActive('/unit/control') && styles.active
              }`}
            onClick={goToControlPage}
          >
            <Link href="/unit/control" className={styles.buttonLink}>
              <img src="/icons/Marker.svg" alt="" />
              <p>Control Mode</p>
            </Link>
          </div>
          <div
            className={`${styles.mapping} ${isActive('/unit/mapping') && styles.active
              }`}
            onClick={goToMappingPage}
          >
            <Link href="/unit/mapping" className={styles.buttonLink}>
              <img src="/icons/mapping.svg" alt="" />
              <p>Mapping</p>
            </Link>
          </div>
          <div
            className={`${styles.database} ${isActive('/unit/database') && styles.active
              }`}
            onClick={goToDatabasePage}
          >
            <Link href="/unit/database" className={styles.buttonLink}>
              <img src="/icons/Database.svg" alt="" />
              <p>Database</p>
            </Link>
          </div>
        </div>

        <div className={styles.mapStream}>
          <div className={styles.mapName}>
            <p>Live Camera Stream</p>
          </div>
          <div className={styles.mapDisplay}>
            {imageSrc ? <img src={imageSrc} alt="Streamed Image" className={styles.map}  /> : (<div className={styles.map} />)}
          </div>
        </div>
      </div>

      <div className={`${styles.centerSection}`}>
        <div
          className={`${styles.greetings} ${isActive('/unit/control') && styles.active
            }`}
        >
          <img src="/icons/user-10-svgrepo-com.svg" alt="" />
          <p>{`Welcome, ${full_name} (${username})`}</p>
        </div>
        <div className={`${styles.menu}`}>
          <select
            className={`${styles.menu} `}
            value={pathname} // Set "/unit/control" as the default value
            onChange={(e) => router.push(e.target.value)}
          >
            {navLinks.map((link) => (
              <option key={link.href} value={link.href}>
                {link.text}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default Navigation;
