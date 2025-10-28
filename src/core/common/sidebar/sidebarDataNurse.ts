// sidebarDataNurse.ts (or similar file name)
"use client";
import { all_routes } from "@/routes/all_routes";
const routes = all_routes;

export const NurseSidebarData = [
    {
        tittle: "Nursing Portal",
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
                label: "Bookings", // Focused on Home Health Care
                link: "#",
                submenu: true,
                icon: "calendar-event",
                base: "bookings",
                submenuItems: [
                    { label: "Add Appointment", link: "/nurse/bookings/add" }, // Placeholder
                    { label: "View Appointments", link: routes.appointments }, // Grid/Calendar view for nurse
                ],
            },
            {
                label: "Allocation",
                link: "/nurse/allocation", // Placeholder
                submenu: false,
                icon: "directions", // Example icon
                base: "allocation",
                submenuItems: [],
            },
            {
                label: "Availability",
                link: "/nurse/availability", // Placeholder
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
                label: "Services", // Specific nursing services
                link: "/nurse/services", // Placeholder
                submenu: false,
                icon: "heart-rate-monitor", // Example icon
                base: "services",
                submenuItems: [],
            },
            {
                label: "Patients", // Link to list or specific dashboard view
                link: routes.patients, // Existing route, maybe filtered view
                submenu: false,
                icon: "user-heart",
                base: "patients",
                submenuItems: [],
            },
            {
                label: "Billing",
                link: routes.invoices, // Link to nurse-related billing/invoices
                submenu: false,
                icon: "file-invoice-dollar",
                base: "billing",
                submenuItems: [],
            },
            {
                label: "Documents",
                link: "/nurse/documents", // Placeholder
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