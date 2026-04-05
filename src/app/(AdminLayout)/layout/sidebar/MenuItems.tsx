import {
  IconLayoutDashboard,
  IconList,
  IconUserPlus,
  IconUserCheck,
  IconSettings,
  IconBuilding,
  IconBuildings,
  IconReport,
} from "@tabler/icons-react";
import { id } from "date-fns/locale";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/admin",
  },
  {
    navlabel: true,
    subheader: "REQUESTS",
  },
  {
    id: uniqueId(),
    title: "Request List",
    icon: IconList,
    href: "/admin/request-list",
  },
  {
    navlabel: true,
    subheader: "USERS MANAGEMENT",
  },
  {
    id: uniqueId(),
    title: "Users",
    icon: IconUserPlus,
    href: "/admin/users",
  },
  {
    id: uniqueId(),
    title: "Pending Accounts",
    icon: IconUserCheck,
    href: "/admin/pending-accounts",
  },
  { navlabel: true, subheader: "DEPARTMENTS" },
  {
    id: uniqueId(),
    title: "Departments",
    icon: IconBuildings,
    href: "/admin/departments",
  },
  {
    navlabel: true,
    subheader: "REPORTS",
  },
  {
    id: uniqueId(),
    title: "Reports",
    icon: IconReport,
    href: "/admin/reports",
  },
  {
    navlabel: true,
    subheader: "SETTINGS",
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: IconSettings,
    href: "/admin/settings",
  },
];

export default Menuitems;
