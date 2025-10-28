"use client";

import React, { useCallback, useEffect, useState } from "react";
// Import all the role-specific sidebar data files
import { AdminSidebarData } from "./sidebarDataAdmin";
import { PatientSidebarData } from "./sidebarDataPatient";
import { ProviderSidebarData } from "./sidebarDataProvider";
import { NurseSidebarData } from "./sidebarDataNurse";
import { TechnicianSidebarData } from "./sidebarDataTechnician";
import { useDispatch, useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { all_routes } from "@/routes/all_routes";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/overlayscrollbars.css";
import { setExpandMenu, setMobileSidebar } from "@/core/redux/sidebarSlice";
import ImageWithBasePath from "@/core/imageWithBasePath";
import { updateTheme } from "@/core/redux/themeSlice";

const Sidebar = () => {
  const Location = usePathname();
  const [subOpen, setSubopen] = useState<any>("");
  const [subsidebar, setSubsidebar] = useState("");
  const [isSidebarOpened, setIsSidebarOpened] = useState(false);
  const [menuData, setMenuData] = useState<any[]>([]); // Initialize empty
  const dispatch = useDispatch();
  const navigate = useRouter();

  const themeSettings = useSelector((state: any) => state.theme.themeSettings);
  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );

  const toggleSidebar = (title: any) => {
    // localStorage.setItem("menuOpened", title); // Optional: Persist open menu state
    if (title === subOpen) {
      setSubopen("");
    } else {
      setSubopen(title);
    }
  };

  const toggleSubsidebar = (subitem: any) => {
    if (subitem === subsidebar) {
      setSubsidebar("");
    } else {
      setSubsidebar(subitem);
    }
  };

  const handleClick = (label: any) => {
    toggleSidebar(label);
  };

  const handleMiniSidebar = () => {
    const rootElement = document.documentElement;
    const isMini = rootElement.getAttribute("data-layout") === "mini";
    const updatedLayout = isMini ? "default" : "mini";
    dispatch(
      updateTheme({
        "data-layout": updatedLayout,
      })
    );
    if (isMini) {
      document.body.classList.remove("mini-sidebar");
    } else {
      document.body.classList.add("mini-sidebar");
    }
  };

  // Handle mouse enter for mini sidebar
  const handleMouseEnter = useCallback(() => {
    const body = document.body;
    if (document.documentElement.getAttribute("data-layout") === "mini") {
      body.classList.add('expand-menu');
    }
    dispatch(setExpandMenu(true));
  }, [dispatch]);

  // Handle mouse leave for mini sidebar
  const handleMouseLeave = useCallback(() => {
    const body = document.body;
    if (document.documentElement.getAttribute("data-layout") === "mini") {
      body.classList.remove('expand-menu');
    }
    dispatch(setExpandMenu(false));
  }, [dispatch]);

  const toggleMobileSidebar = () => {
    const body = document.body;
    body.classList.toggle("slide-nav");
    dispatch(setMobileSidebar(!mobileSidebar));
    setIsSidebarOpened(body.classList.contains("slide-nav"));

    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      if (body.classList.contains("slide-nav")) {
        overlay.classList.add('opened');
      } else {
        overlay.classList.remove('opened');
      }
    }
  };

  useEffect(() => {
    // 1. Load the correct sidebar data based on user type from localStorage
    const loadSidebarData = () => {
      let detectedUserType: string | null = null;
      if (typeof window !== 'undefined') {
        try {
          const lsType = localStorage.getItem('user_type') || localStorage.getItem('profile_user_type');
          if (lsType) detectedUserType = lsType;
          else {
            const rawProfile = localStorage.getItem('profile') || localStorage.getItem('user');
            if (rawProfile) {
              try {
                const parsed = JSON.parse(rawProfile);
                if (parsed?.user_type) detectedUserType = parsed.user_type;
              } catch (_) { /* ignore JSON parse error */ }
            }
          }
        } catch (lsErr) { console.error("Error reading user type from localStorage", lsErr); }
      }

      // Load the correct data structure
      switch (String(detectedUserType).toLowerCase()) {
        case 'admin':
          setMenuData(AdminSidebarData);
          break;
        case 'patient':
          setMenuData(PatientSidebarData);
          break;
        case 'provider':
          setMenuData(ProviderSidebarData);
          break;
        case 'nurse':
          setMenuData(NurseSidebarData);
          break;
        case 'technician':
          setMenuData(TechnicianSidebarData);
          break;
        default:
          console.warn(`Unknown or missing user type ('${detectedUserType}'), loading Admin menu as default.`);
          setMenuData(AdminSidebarData); // Default to Admin menu
      }
    };

    loadSidebarData();

    // 2. Apply theme settings
    const rootElement: any = document.documentElement;
    Object.entries(themeSettings).forEach(([key, value]) => {
      rootElement.setAttribute(key, value);
    });

    if (themeSettings["data-layout"] === "mini") {
      document.body.classList.add("mini-sidebar");
    } else {
      document.body.classList.remove("mini-sidebar");
    }

    if (themeSettings.dir === "rtl") {
      rootElement.setAttribute("dir", "rtl");
    } else {
      rootElement.setAttribute("dir", "ltr");
    }

    // --- Restore original logic to find initially open menu based on location ---
    let currentSubOpen = "";
    // Need to iterate through the loaded menuData to find the active parent
    menuData.forEach((mainLabel) => {
      mainLabel.submenuItems?.forEach((title: any) => {
        let link_array: string[] = [];
        if ("submenuItems" in title && title.submenuItems) {
          title.submenuItems?.forEach((link: any) => {
            link_array.push(link?.link);
            if (link?.submenu && "submenuItems" in link && link.submenuItems) {
              link.submenuItems?.forEach((item: any) => {
                link_array.push(item?.link);
              });
            }
          });
        }
        // Check if current location is in this item's link array or matches its direct link
        if (link_array.includes(Location) || title?.link === Location) {
          currentSubOpen = title?.label;
        }
      });
    });

    if (currentSubOpen && !subOpen) { // Avoid resetting if user manually toggled
      setSubopen(currentSubOpen);
    }
    // You might need similar logic for subsidebar if you want level 3 open on load

  }, [themeSettings, Location, menuData]); // Re-run effect


  return (
    <>
      {/* Sidenav Menu Start */}
      <div
        className="sidebar"
        id="sidebar"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Start Logo */}
        <div className="sidebar-logo">
          <div>
            <Link href={all_routes.dashboard} className="logo logo-normal">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ImageWithBasePath src="assets/img/EMR_Logo.jpg" alt="Logo" style={{ height: 36 }} />
                <span style={{ color: '#419794', fontWeight: 700, fontSize: 21 }}> EMR</span>
              </div>
            </Link>
            <Link href={all_routes.dashboard} className="logo-small">
              <ImageWithBasePath src="assets/img/EMR_Logo_small.png" alt="Logo" />
            </Link>
            {/* <Link href={all_routes.dashboard} className="dark-logo">...</Link> */}
          </div>
          <button
            className="sidenav-toggle-btn btn border-0 p-0 active"
            id="toggle_btn"
            onClick={handleMiniSidebar}
            aria-label="Toggle Sidebar Mini/Default"
          >
            <i className="ti ti-arrow-left" />
          </button>
          <button className="sidebar-close d-lg-none" onClick={toggleMobileSidebar} aria-label="Close Mobile Sidebar">
            <i className="ti ti-x align-middle" />
          </button>
        </div>
        {/* End Logo */}

        {/* Sidenav Menu */}
        <div className="sidebar-inner">
          <OverlayScrollbarsComponent
            options={{ scrollbars: { autoHide: 'scroll' } }}
            style={{ height: "calc(100% - 60px)", width: "100%" }}
            defer
          >
            {/* --- RESTORED ORIGINAL JSX STRUCTURE & ACTIVE LOGIC --- */}
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {menuData?.map((mainLabel, index) => (
                  <React.Fragment key={`main-${index}`}>
                    {mainLabel?.tittle && (
                      <li className="menu-title">
                        <span>{mainLabel.tittle}</span>
                      </li>
                    )}
                    {/* This single LI wraps the UL for the section's items */}
                    <li>
                      <ul>
                        {mainLabel?.submenuItems?.map((title: any, i: any) => {
                          // Calculate link_array *inside* the map, like the original code
                          let link_array: any = [];
                          if (title.submenuItems) { // Check if submenuItems exists
                            title.submenuItems?.forEach((link: any) => {
                              link_array.push(link?.link);
                              if (link?.submenu && link.submenuItems) {
                                link.submenuItems?.forEach((item: any) => {
                                  link_array.push(item?.link);
                                });
                              }
                            });
                          }
                          // Assign calculated links back to the item for checking active state
                          // Note: Mutating props like this isn't ideal React, but matches original logic
                          title.links = link_array;

                          return (
                            <li className={`${title.submenu ? "submenu" : ""}`} key={`title-${index}-${i}`}> {/* Moved submenu class here */}
                              <Link
                                href={title?.submenu ? "#" : (title?.link || "#")}
                                onClick={(e) => {
                                  if (title?.submenu) {
                                    e.preventDefault();
                                    handleClick(title?.label); // Toggle this submenu
                                  } else if (window.innerWidth < 992) {
                                    toggleMobileSidebar(); // Close mobile on direct click
                                  }
                                }}
                                // Original active class logic
                                className={`${(subOpen === title?.label && title.submenu) ? "subdrop" : ""} ${title?.links?.includes(Location) || title?.link === Location ? "active" : ""
                                  }`}
                                aria-current={title?.link === Location ? "page" : undefined}
                              >
                                {title.icon && <i className={`ti ti-${title.icon} me-2`}></i>} {/* Icon with spacing */}
                                <span>{title?.label}</span>
                                {title?.submenu && <span className="menu-arrow"></span>}
                              </Link>

                              {/* Render second-level submenu if it exists */}
                              {title?.submenu && title.submenuItems && ( // Added check for submenuItems
                                <ul
                                  style={{
                                    display: subOpen === title?.label ? "block" : "none",
                                  }}
                                >
                                  {title?.submenuItems?.map((item: any, j: any) => {
                                    // Original active logic for sub-items
                                    const isSubActive = item?.submenuItems?.map((link: any) => link?.link).includes(Location) || item?.link === Location;

                                    return (
                                      <li className={`${item.submenu ? "submenu submenu-two" : ""}`} key={`item-${index}-${i}-${j}`}>
                                        <Link
                                          href={item?.submenu ? "#" : (item?.link || "#")}
                                          className={`${isSubActive ? (item.submenu ? "active subdrop" : "active") : ""} ${subsidebar === item?.label ? "subdrop" : ""}`}
                                          onClick={(e) => {
                                            if (item?.submenu) {
                                              e.preventDefault();
                                              toggleSubsidebar(item?.label); // Toggle deeper submenu
                                            } else if (window.innerWidth < 992) {
                                              toggleMobileSidebar(); // Close mobile on direct click
                                            }
                                          }}
                                          aria-current={item?.link === Location ? "page" : undefined}
                                        >
                                          {item?.label}
                                          {item?.submenu && <span className="menu-arrow"></span>}
                                        </Link>

                                        {/* Render third-level submenu if it exists */}
                                        {item?.submenu && item.submenuItems && ( // Added check for submenuItems
                                          <ul
                                            style={{
                                              display: subsidebar === item?.label ? "block" : "none",
                                            }}
                                          >
                                            {item?.submenuItems?.map((items: any, k: any) => (
                                              <li key={`submenu-item-${index}-${i}-${j}-${k}`}>
                                                <Link
                                                  href={items?.link || "#"}
                                                  className={`${items?.link === Location ? "active" : ""}`}
                                                  onClick={() => { if (window.innerWidth < 992) { toggleMobileSidebar(); } }}
                                                  aria-current={items?.link === Location ? "page" : undefined}
                                                >
                                                  {items?.label}
                                                </Link>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            </div>
            {/* --- END RESTORED STRUCTURE --- */}
          </OverlayScrollbarsComponent>
        </div>
      </div>
      {/* Sidenav Menu End */}

      {/* Overlay for mobile sidebar */}
      <div
        className={`sidebar-overlay ${mobileSidebar ? "opened" : ""}`}
        onClick={toggleMobileSidebar} // Close sidebar when overlay is clicked
      ></div>
    </>
  );
};

export default Sidebar;