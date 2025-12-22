import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon, // Change to Icons.Grid if available
        items: [],
      },
      {
        title: "Quotations",
        url: "/quotation",
        icon: Icons.Quotation,
        items: [],
      },
      {
        title: "Invoices",
        url: "/invoices",
        icon: Icons.Invoice, // Change to Icons.FileText if available
        items: [],
      },
      {
        title: "Payments Received",
        url: "/payments",
        icon: Icons.Payments,
        items: [],
      },
      {
        title: "Products & Services",
        url: "/products",
        icon: Icons.Products,
        items: [],
      },
      {
        title: "Clients",
        url: "/clients",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Reports",
        url: "/reports",
        icon: Icons.Reports,
        items: [],
      },
    ],
  },
  {
    label: "OTHERS",
    items: [
      {
        title: "Setting",
        icon: Icons.Setting,
        items: [],
        url: "/Setting",
      },
      {
        title: "Help Center",
        icon: Icons.HelpCenter,
        items: [],
        url: "/help_center",
      },
      {
        title: "Sign out",
        icon: Icons.LogOutIcon,
        items: [],
        url: "/auth/sign-in",
      },
    ],
  },
];
