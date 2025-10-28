"use client";

import React, { useCallback, useEffect, useState } from "react";
import { SidebarData } from "./sidebarData";
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
  const [menuData, setMenuData] = useState<any[]>(SidebarData || []);
  const dispatch = useDispatch();

  const toggleSidebar = (title: any) => {
    localStorage.setItem("menuOpened", title);
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

  const navigate = useRouter();
  const themeSettings = useSelector((state: any) => state.theme.themeSettings);

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
    if (body.classList.contains('mini-sidebar')) {
      body.classList.add('expand-menu');
    }
    dispatch(setExpandMenu(true));
  }, [dispatch]);

  // Handle mouse leave for mini sidebar
  const handleMouseLeave = useCallback(() => {
    const body = document.body;
    if (body.classList.contains('mini-sidebar')) {
      body.classList.remove('expand-menu');
    }
    dispatch(setExpandMenu(false));
  }, [dispatch]);


  const handleLayoutClick = (layout: string) => {
    const layoutSettings: any = {
      "data-layout": "default",
      dir: "ltr",
    };

    switch (layout) {
      case "Default":
        layoutSettings["data-layout"] = "default";
        layoutSettings.dir = "ltr";
        break;
      case "Hidden":
        layoutSettings["data-layout"] = "hidden";
        break;
      case "Mini":
        layoutSettings["data-layout"] = "mini";
        break;
      case "Hover View":
        layoutSettings["data-layout"] = "hoverview";
        break;
      case "Full Width":
        layoutSettings["data-layout"] = "full-width";
        break;
      case "RTL":
        layoutSettings.dir = "rtl";
        break;
      default:
        layoutSettings.dir = "ltr";
        break;
    }
    dispatch(updateTheme(layoutSettings));
    navigate.push("/dashboard");
  };
  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );
  const toggleMobileSidebar = () => {
    const body = document.body;
    body.classList.remove("slide-nav");
    setIsSidebarOpened(false);
    // Remove 'opened' class from sidebar-overlay if present
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.classList.remove('opened');
    }
  };
  useEffect(() => {
    // Determine user_type from localStorage only and filter sidebar menu accordingly.
    const loadUserTypeAndFilter = () => {
      try {
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
                } catch (_) {
                  // ignore json parse
                }
              }
            }
          } catch (lsErr) { /* ignore */ }
        }

        const filterByUserType = (data: any[], userType: string | null) => {
          if (!userType) return data;
          const ut = String(userType).toLowerCase();
          if (ut === 'admin') return data;

          const mapping: Record<string, string> = {
            patient: 'patients',
            provider: 'providers',
            nurse: 'nurses',
            technician: 'technicians',
          };
          const allowedLabelRaw = mapping[ut] ?? null;
          if (!allowedLabelRaw) return data;

          const allowedLabel = (label: string) => String(label || '').toLowerCase() === allowedLabelRaw;
          const isDashboard = (label: string) => String(label || '').toLowerCase() === 'dashboard';

          // Keep Dashboard always (from Analytics) and the role-specific menu items.
          const cloned = JSON.parse(JSON.stringify(data || []));
          const result: any[] = [];

          cloned.forEach((section: any) => {
            const items = (section.submenuItems || []).filter((item: any) => {
              // include Dashboard for everyone
              if (isDashboard(item.label)) return true;
              // include role-specific labels (match recursively)
              const containsAllowed = (it: any): boolean => {
                if (!it) return false;
                if (allowedLabel(it.label)) return true;
                if (Array.isArray(it.submenuItems)) return it.submenuItems.some((si: any) => containsAllowed(si));
                return false;
              };
              return containsAllowed(item);
            });

            if ((items || []).length > 0) {
              result.push({ ...section, submenuItems: items });
            }
          });

          return result;
        };

        const filtered = filterByUserType(SidebarData, detectedUserType);
        setMenuData(filtered);
      } catch (e) {
        console.debug('[sidebar] failed to determine user_type for menu filtering', e);
        setMenuData(SidebarData);
      }
    };

    loadUserTypeAndFilter();

    const rootElement: any = document.documentElement;
    Object.entries(themeSettings).forEach(([key, value]) => {
      rootElement.setAttribute(key, value);
    });
    if (themeSettings["data-layout"] === "mini") {
      document.body.classList.add("mini-sidebar");
    }
    else if (Location === "/layout-rtl") {
      rootElement.setAttribute("dir", "rtl");
    } else {
      document.body.classList.remove("mini-sidebar");
      rootElement.setAttribute("dir", "ltr");
    }
  }, [themeSettings, Location]);



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
            {/* Logo Normal */}
            <Link href={all_routes.dashboard} className="logo logo-normal">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ImageWithBasePath src="assets/img/EMR_Logo.jpg" alt="Logo" style={{ height: 36 }} />
                <span style={{ color: '#419794', fontWeight: 700, fontSize: 21 }}>  EMR</span>
              </div>
            </Link>
            {/* Logo Small */}
            <Link href={all_routes.dashboard} className="logo-small">
              <ImageWithBasePath src="assets/img/EMR_Logo_small.png" alt="Logo" />
            </Link>
            {/* Logo Dark */}
            <Link href={all_routes.dashboard} className="dark-logo">
              <ImageWithBasePath src="assets/img/logo-white.svg" alt="Logo" />
            </Link>
          </div>
          <button
            className="sidenav-toggle-btn btn border-0 p-0 active"
            id="toggle_btn"
            onClick={handleMiniSidebar}
          >
            <i className="ti ti-arrow-left" />
          </button>
          {/* Sidebar Menu Close */}
          <button className="sidebar-close" onClick={toggleMobileSidebar}>
            <i className="ti ti-x align-middle" />
          </button>
        </div>
        {/* End Logo */}
        {/* Sidenav Menu */}
        <div className="sidebar-inner">
          <OverlayScrollbarsComponent style={{ height: "100%", width: "100%" }}>
            <div id="sidebar-menu" className="sidebar-menu">

              <ul>
                {menuData?.map((mainLabel, index) => (
                  <React.Fragment key={`main-${index}`}>
                    <li className="menu-title">
                      <span>{mainLabel?.tittle}</span>
                    </li>
                    <li>
                      <ul>
                        {mainLabel?.submenuItems?.map((title: any, i: any) => {
                          let link_array: any = [];
                          if ("submenuItems" in title) {
                            title.submenuItems?.forEach((link: any) => {
                              link_array.push(link?.link);
                              if (link?.submenu && "submenuItems" in link) {
                                link.submenuItems?.forEach((item: any) => {
                                  link_array.push(item?.link);
                                });
                              }
                            });
                          }
                          title.links = link_array;

                          return (
                            <li className="submenu" key={`title-${i}`}>
                              <Link
                                href={title?.submenu ? "#" : title?.link}
                                onClick={(e) => {
                                  if (title?.submenu) {
                                    e.preventDefault();
                                  }
                                  handleClick(title?.label);

                                  if (mainLabel?.tittle === "Layout") {
                                    handleLayoutClick(title?.label);
                                  }
                                }}
                                className={`${subOpen === title?.label
                                  ? "subdrop"
                                  : ""
                                  } ${title?.links?.includes(Location) ||
                                    title?.link === Location
                                    ? "active"
                                    : ""
                                  }`}
                              >
                                <i className={`ti ti-${title.icon}`}></i>
                                <span>{title?.label}</span>
                                {(title?.submenu || title?.customSubmenuTwo) && (
                                  <span className="menu-arrow"></span>
                                )}
                                {title?.submenu === false &&
                                  title?.version === "v1.6.7" && (
                                    <span className="badge bg-danger ms-2 rounded-2 badge-md fs-12 fw-medium">
                                      v1.6.7
                                    </span>
                                  )}
                              </Link>

                              {title?.submenu !== false && (
                                <ul
                                  style={{
                                    display:
                                      subOpen === title?.label
                                        ? "block"
                                        : "none",
                                  }}
                                >
                                  {title?.submenuItems?.map(
                                    (item: any, j: any) => {
                                      const isSubActive =
                                        item?.submenuItems
                                          ?.map((link: any) => link?.link)
                                          .includes(Location) ||
                                        item?.link === Location;

                                      return (
                                        <li
                                          className={`${item?.submenuItems
                                            ? "submenu submenu-two"
                                            : ""
                                            } `}
                                          key={`item-${j}`}
                                        >
                                          <Link
                                            href={item?.submenu ? "#" : item?.link}
                                            className={`${isSubActive ? "active subdrop" : ""
                                              } ${subsidebar === item?.label
                                                ? "subdrop"
                                                : ""
                                              }`}
                                            onClick={() => {
                                              toggleSubsidebar(item?.label);
                                              if (title?.label === "Layouts") {
                                                handleLayoutClick(item?.label);
                                              }
                                            }}


                                          >
                                            {item?.label}
                                            {(item?.submenu ||
                                              item?.customSubmenuTwo) && (
                                                <span className="menu-arrow"></span>
                                              )}
                                          </Link>
                                          {item?.submenuItems ? (
                                            <ul
                                              style={{
                                                display:
                                                  subsidebar === item?.label
                                                    ? "block"
                                                    : "none",
                                              }}
                                            >
                                              {item?.submenuItems?.map(
                                                (items: any, k: any) => {
                                                  const isSubSubActive =
                                                    items?.submenuItems
                                                      ?.map(
                                                        (link: any) => link.link
                                                      )
                                                      .includes(
                                                        Location
                                                      ) ||
                                                    items?.link ===
                                                    Location;

                                                  return (
                                                    <li key={`submenu-item-${k}`}>
                                                      <Link
                                                        href={
                                                          items?.submenu
                                                            ? "#"
                                                            : items?.link
                                                        }
                                                        className={`${isSubSubActive
                                                          ? "active"
                                                          : ""
                                                          }`}
                                                      >
                                                        {items?.label}
                                                      </Link>
                                                    </li>
                                                  );
                                                }
                                              )}
                                            </ul>
                                          ) : null}
                                        </li>
                                      );
                                    }
                                  )}
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
            <div className="sidebar-footer border-top mt-3">
              <div className="trial-item mt-0 p-3 text-center">
                <div className="trial-item-icon rounded-4 mb-3 p-2 text-center shadow-sm d-inline-flex">
                  <ImageWithBasePath
                    src="./assets/img/icons/sidebar-icon.svg"
                    alt="img"
                  />
                </div>
                <div>
                  <h6 className="fs-14 fw-semibold mb-1">Upgrade To Pro</h6>
                  <p className="fs-13 mb-0">
                    Check 1 min video and begin use   EMR like a pro
                  </p>
                </div>
                <Link
                  href="#"
                  className="close-icon shadow-sm"

                >
                  <i className="ti ti-x" />
                </Link>
              </div>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </div>
      {/* Sidenav Menu End */}

      <div className={`sidebar-overlay${isSidebarOpened ? " opened" : ""}`}></div>
    </>
  );
};

export default Sidebar;
