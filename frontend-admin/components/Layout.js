import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  FiHome, 
  FiUsers, 
  FiDollarSign, 
  FiFileText, 
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiSearch
} from 'react-icons/fi';
import { getAuth, clearAuth } from '../lib/auth';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { user: authUser } = getAuth();
    if (!authUser) {
      router.push('/login');
    } else {
      setUser(authUser);
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', icon: FiHome, label: 'Tableau de bord', roles: ['admin', 'secretaire', 'tresorier'] },
    { href: '/members', icon: FiUsers, label: 'Membres', roles: ['admin', 'secretaire', 'tresorier'] },
    { href: '/contributions', icon: FiDollarSign, label: 'Cotisations', roles: ['admin', 'secretaire', 'tresorier'] },
    { href: '/celebrants', icon: FiSearch, label: 'Par Célébrant', roles: ['admin', 'secretaire', 'tresorier'] },
    { href: '/reports', icon: FiFileText, label: 'Rapports', roles: ['admin', 'secretaire', 'tresorier'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.logo}>🌟 EHK</h2>
          <button 
            className={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
        
        <nav className={styles.nav}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || 
                           router.pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon className={styles.navIcon} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            {sidebarOpen && (
              <>
                <p className={styles.userName}>{user.email}</p>
                <p className={styles.userRole}>{user.role}</p>
              </>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut />
            {sidebarOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}

