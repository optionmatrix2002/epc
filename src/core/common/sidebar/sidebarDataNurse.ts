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
                link: "#",
                submenu: false,
                icon: "directions", // Example icon
                base: "allocation",
                submenuItems: [],
            },
            {
                label: "Availability",
                link: "#",
                submenu: false,
                icon: "calendar-time",
                base: "availability",
                submenuItems: [],
            },
            {
                label: "Profile",
                link: "#",
                submenu: false,
                icon: "user-circle",
                base: "profile",
                submenuItems: [],
            },
            {
                label: "Services", // Specific nursing services
                link: "#",
                submenu: false,
                icon: "heart-rate-monitor", // Example icon
                base: "services",
                submenuItems: [],
            },
            {
                label: "Patients", // Link to list or specific dashboard view
                link: "#",
                submenu: false,
                icon: "user-heart",
                base: "patients",
                submenuItems: [],
            },
            {
                label: "Billing",
                link: "#",
                submenu: false,
                icon: "file-invoice-dollar",
                base: "billing",
                submenuItems: [],
            },
            {
                label: "Documents",
                link: "#",
                submenu: false,
                icon: "file-stack",
                base: "documents",
                submenuItems: [],
            },
            {
                label: "Messaging",
                link: "#",
                submenu: false,
                icon: "message-dots",
                base: "chat",
                submenuItems: [],
            },
        ],
    },
];