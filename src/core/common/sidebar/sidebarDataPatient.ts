// sidebarDataPatient.ts (or similar file name)
"use client";
import { all_routes } from "@/routes/all_routes";
const routes = all_routes;

export const PatientSidebarData = [
    {
        tittle: "Patient Portal",
        icon: "airplay",
        showAsTab: true,
        separateRoute: false,
        submenuItems: [
            {
                label: "Health Dashboard",
                link: routes.dashboard, // Reuse main dashboard or create a specific patient one
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
                    { label: "Add Appointment", link: "/patient/bookings/add" }, // Placeholder
                    { label: "View Appointments", link: routes.appointments }, // Grid/Calendar view
                    // Specific types might be filters on the View page, not separate menu items
                    // { label: "Consultations", link: "/patient/bookings/consultations" },
                    // { label: "Procedures", link: "/patient/bookings/procedures" },
                    // ... etc.
                ],
            },
            {
                label: "Profile", // Includes MRN info
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
                link: "#",
                submenu: false,
                icon: "report-medical",
                base: "procedures",
                submenuItems: [],
            },
            {
                label: "Diagnostics",
                link: "#",
                submenu: false,
                icon: "clipboard-heart",
                base: "diagnostics",
                submenuItems: [],
            },
            {
                label: "Imaging",
                link: "#",
                submenu: false,
                icon: "photo-scan",
                base: "imaging",
                submenuItems: [],
            },
            {
                label: "Clinical Services",
                link: "#",
                submenu: false,
                icon: "building-hospital",
                base: "clinical-services",
                submenuItems: [],
            },
            {
                label: "Nursing",
                link: "#",
                submenu: false,
                icon: "home-exclamation",
                base: "nursing",
                submenuItems: [],
            },
            {
                label: "Accommodation",
                link: "#",
                submenu: true,
                icon: "bed",
                base: "accommodation",
                submenuItems: [
                    { label: "Reserve Room", link: "/patient/accommodation/reserve" }, // General booking page
                    // Different room types might be options within the reservation form
                    // { label: "Emergency Ward", link: "/patient/accommodation/emergency" },
                    // { label: "General Ward", link: "/patient/accommodation/general" },
                ],
            },
            {
                label: "Billing",
                link: "#", // Link to patient invoices list
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