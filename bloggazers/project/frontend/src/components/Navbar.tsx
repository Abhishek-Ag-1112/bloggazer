// src/components/Navbar.tsx
import React, {
  useLayoutEffect,
  useRef,
  useState,
  useMemo,
  useEffect,
} from 'react';

import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Moon,
  Sun,
  ArrowUpRight,
  PenSquare,
  LogOut,
  User,
  Home,
  BookOpen,
  Info,
  Mail,
  PanelTopOpen,
  Hash,
  Tag,
  Bookmark, // <-- ADDED
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Define the types for navigation items
type CardNavLink = {
  label: string;
  to: string; // Changed from href to 'to' for react-router-dom
  ariaLabel: string;
  icon: React.ElementType;
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

const Navbar: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, signIn, signOut } = useAuth();

  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const ease = 'power3.out';

  // --- Dynamic Content Generation ---
  const items = useMemo(() => {
    const cardBgColor = isDark
      ? 'rgba(3, 7, 18, 0.25)' // dark: bg-gray-800/75
      : 'rgba(255, 255, 255, 0.75)'; // light: bg-white/75
    const cardTextColor = isDark ? '#fff' : '#000';

    const navItems: CardNavItem[] = [
      {
        label: 'Browse',
        bgColor: cardBgColor,
        textColor: cardTextColor,
        links: [
          {
            label: 'Home',
            to: '/',
            ariaLabel: 'Go to Home',
            icon: Home,
          },
          {
            label: 'All Blogs',
            to: '/blogs',
            ariaLabel: 'See all blogs',
            icon: BookOpen,
          },
          {
            label: 'Categories',
            to: '/categories',
            ariaLabel: 'Browse by category',
            icon: Hash,
          },
          {
            label: 'Tags',
            to: '/tags',
            ariaLabel: 'Browse by tag',
            icon: Tag,
          },
        ],
      },
      {
        label: 'Info',
        bgColor: cardBgColor,
        textColor: cardTextColor,
        links: [
          {
            label: 'About',
            to: '/about',
            ariaLabel: 'Learn about us',
            icon: Info,
          },
          {
            label: 'Contact',
            to: '/contact',
            ariaLabel: 'Get in touch',
            icon: Mail,
          },
        ],
      },
    ];

    if (user) {
      navItems.push({
        label: 'My Account',
        bgColor: cardBgColor,
        textColor: cardTextColor,
        links: [
          {
            label: 'Profile',
            to: '/profile',
            ariaLabel: 'View your profile',
            icon: User,
          },
          {
            label: 'Write Blog',
            to: '/create-blog',
            ariaLabel: 'Create a new blog post',
            icon: PenSquare,
          },
          {
            label: 'Bookmarks',
            to: '/bookmarks',
            ariaLabel: 'View your bookmarked posts',
            icon: Bookmark,
          },
        ],
      });
    }

    return navItems;
  }, [user, isDark]);

  // --- ADDED SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => {
      // Set state to true if scrolled more than 0px, false otherwise
      setIsScrolled(window.scrollY > 0);
    };

    // Add event listener on mount
    window.addEventListener('scroll', handleScroll);

    // Remove event listener on unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- GSAP & Sizing Logic (Unchanged) ---
  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content') as HTMLElement;
      if (contentEl) {
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        contentEl.offsetHeight;

        const topBar = 60;
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    // Desktop height
    return 260;
  };

  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease,
    });

    tl.to(
      cardsRef.current,
      { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
      '-=0.1'
    );

    return tl;
  };

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items]); // Re-run if items change (e.g., user logs in)

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, items]); // Also depend on items

  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      tl.play(0);
    } else {
      setIsHamburgerOpen(false);
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  // --- Glassmorphism & Color Logic (MODIFIED) ---
  const navBgClass = isDark
    ? 'bg-gray-950/75' // Dark mode glassmorphism
    : 'bg-white/75'; // Light mode glassmorphism
  const menuColor = isDark ? '#fff' : '#000';
  const hamburgerLineClass = isDark ? 'bg-white' : 'bg-gray-950'; // <-- MODIFIED

  return (
    // --- MODIFIED CONTAINER ---
    <div
      className={`card-nav-container fixed left-1/2 -translate-x-1/2 w-[90%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em]
                  transition-transform duration-300 ease-out transform-origin-top
                  ${isScrolled ? 'scale-95' : 'scale-100'}`} // <-- APPLIES SCALE
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''
          } block h-[100px] p-0 rounded-xl shadow-lg relative overflow-visible will-change-[height]
           backdrop-blur-lg border border-white/10 dark:border-gray-800/50 ${navBgClass}`} // <-- MODIFIED
      >
        {/* --- Top Bar (Unchanged) --- */}
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          {/* Hamburger Menu */}
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''
              } group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] order-2 md:order-none cursor-target`}
            onClick={toggleMenu}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor }}
          >
            <div
              className={`hamburger-line w-[40px] h-[2px] transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? 'translate-y-[5px] rotate-45' : ''
                } group-hover:opacity-75 ${hamburgerLineClass}`} // <-- MODIFIED
            />
            <div
              className={`hamburger-line w-[30px] h-[2px] transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? '-translate-y-[5px] -rotate-45' : ''
                } group-hover:opacity-75 ${hamburgerLineClass}`} // <-- MODIFIED
            />
          </div>

          {/* === MODIFIED LOGO BLOCK === */}
          <div className="logo-container flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            <Link
              to="/"
              className="flex items-center space-x-2 cursor-target" // <-- Make the link a flex container
              onClick={() => isExpanded && toggleMenu()} // Close menu on logo click
            >
              {/* Logo Image */}
              <img
                src="/Bloggs.png"
                alt="Bloggazers Logo"
                className="h-12 w-auto"
              />
              {/* Logo Text */}
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300"> {/* <-- MODIFIED */}

              </span>
            </Link>
          </div>
          {/* === END MODIFIED LOGO BLOCK === */}


          {/* Desktop Auth & Theme Toggle (from old Navbar) */}
          <div className="hidden md:flex items-center space-x-4 order-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors cursor-target"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {user ? (
              <Link
                to="/profile"
                className="flex items-center p-1 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors cursor-target"
              >
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-full"
                />
              </Link>
            ) : (
              <button
                onClick={signIn}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-target"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* --- Card Content Area (Unchanged) --- */}
        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] ${isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
            } md:flex-row md:items-end md:gap-[12px]`}
          aria-hidden={!isExpanded}
        >
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-lg
                         min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]
                         backdrop-blur-sm border border-white/10" // Card glassmorphism
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px] md:text-[22px] flex items-center gap-2">
                <PanelTopOpen className="w-5 h-5" />
                {item.label}
              </div>
              <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
                {item.links?.map((lnk, i) => (
                  <Link
                    key={`${lnk.label}-${i}`}
                    className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] cursor-target"
                    to={lnk.to}
                    aria-label={lnk.ariaLabel}
                    onClick={toggleMenu} // Close menu on link click
                  >
                    {React.createElement(lnk.icon, {
                      className: "nav-card-link-icon shrink-0 w-4 h-4",
                      "aria-hidden": "true",
                    })}
                    {lnk.label}
                    <ArrowUpRight className="w-4 h-4 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* --- Mobile-only Auth & Theme (Unchanged) --- */}
          <div
            className="md:hidden nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-lg
                         min-w-0 flex-[1_1_auto] h-auto min-h-[60px]
                         backdrop-blur-sm border border-white/10" // Card glassmorphism
            ref={setCardRef(items.length)} // Add this to the animation
            style={{
              backgroundColor: isDark
                ? 'rgba(31, 41, 55, 0.75)'
                : 'rgba(255, 255, 255, 0.75)',
              color: isDark ? '#fff' : '#000',
            }}
          >
            <div className="nav-card-label font-normal tracking-[-0.5px] text-[18px]">
              Options
            </div>
            <div className="nav-card-links mt-auto flex flex-col gap-[2px]">
              <button
                onClick={toggleTheme}
                className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] w-full cursor-target"
              >
                {isDark ? (
                  <Sun className="nav-card-link-icon shrink-0 w-4 h-4" />
                ) : (
                  <Moon className="nav-card-link-icon shrink-0 w-4 h-4" />
                )}
                <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              {user ? (
                <button
                  onClick={() => {
                    signOut();
                    toggleMenu();
                  }}
                  className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] w-full text-red-600 cursor-target"
                >
                  <LogOut className="nav-card-link-icon shrink-0 w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    signIn();
                    toggleMenu();
                  }}
                  className="nav-card-link inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[15px] md:text-[16px] w-full text-blue-600 dark:text-blue-400 cursor-target"
                >
                  <User className="nav-card-link-icon shrink-0 w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;