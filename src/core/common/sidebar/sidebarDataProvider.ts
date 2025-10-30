// sidebarDataProvider.ts (or similar file name)
"use client";
import { all_routes } from "@/routes/all_routes";
const routes = all_routes;

export const ProviderSidebarData = [
    {
        tittle: "Provider Portal",
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
                label: "Bookings",
                link: "#",
                submenu: true,
                icon: "calendar-event",
                base: "bookings",
                submenuItems: [
                    { label: "Add Appointment", link: "/provider/bookings/add" }, // Placeholder
                    { label: "View Appointments", link: routes.appointments }, // Grid/Calendar view for provider
                    // Might filter by Consultation/Procedure on the View page
                ],
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
                label: "Consultations",
                link: "#",
                submenu: false,
                icon: "stethoscope",
                base: "consultations",
                submenuItems: [],
            },
            {
                label: "Procedures",
                link: "#", // Existing route, filtered for provider
                submenu: false,
                icon: "report-medical",
                base: "procedures",
                submenuItems: [],
            },
            {
                label: "Patients", // Link to list or specific dashboard view
                link: "#", // Existing route, maybe filtered view
                submenu: false,
                icon: "user-heart",
                base: "patients",
                submenuItems: [],
            },
            {
                label: "Billing",
                link: "#", // Link to provider-related invoices
                submenu: false,
                icon: "coin",
                base: "billing",
                submenuItems: [],
            },
            {
                label: "Documents",
                link: "#", // Placeholder
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