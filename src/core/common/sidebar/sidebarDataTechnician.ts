// sidebarDataTechnician.ts (or similar file name)
"use client";
import { all_routes } from "@/routes/all_routes";
const routes = all_routes;

export const TechnicianSidebarData = [
    {
        tittle: "Technician Portal",
        icon: "airplay",
        showAsTab: true,
        separateRoute: false,
        submenuItems: [
            {
                label: "Dashboard", // Added a dashboard link
                link: routes.dashboard,
                submenu: false,
                icon: "layout-dashboard",
                base: "dashboard",
                submenuItems: [],
            },
            {
                label: "Allocation",
                link: "/technician/allocation", // Placeholder
                submenu: false,
                icon: "directions", // Example icon
                base: "allocation",
                submenuItems: [],
            },
            {
                label: "Availability",
                link: "/technician/availability", // Placeholder
                submenu: false,
                icon: "calendar-time",
                base: "availability",
                submenuItems: [],
            },
            {
                label: "Profile",
                link: routes.profile, // Or profilesettings
                submenu: false,
                icon: "user-circle",
                base: "profile",
                submenuItems: [],
            },
            {
                label: "Tasks", // Added Tasks section (could replace billing if not needed)
                link: "/technician/tasks", // Placeholder for task list
                submenu: false,
                icon: "clipboard-list",
                base: "tasks",
                submenuItems: [],
            },
            // Billing might not be relevant for technicians, consider removing or replacing
            // {
            //   label: "Billing",
            //   link: routes.invoices, // Link to technician-related billing/invoices
            //   submenu: false,
            //   icon: "file-invoice-dollar",
            //   base: "billing",
            //   submenuItems: [],
            // },
            {
                label: "Documents",
                link: "/technician/documents", // Placeholder
                submenu: false,
                icon: "file-stack",
                base: "documents",
                submenuItems: [],
            },
            {
                label: "Messaging",
                link: routes.chat, // Existing route
                submenu: false,
                icon: "message-dots",
                base: "chat",
                submenuItems: [],
            },
        ],
    },
];