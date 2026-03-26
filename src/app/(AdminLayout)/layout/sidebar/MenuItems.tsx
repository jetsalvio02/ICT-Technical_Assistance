import {
  IconLayoutDashboard,
  IconList,
  IconUserPlus,
  IconSettings,
  IconBuilding,
  IconBuildings,
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
  { navlabel: true, subheader: "DEPARTMENTS" },
  {
    id: uniqueId(),
    title: "Departments",
    icon: IconBuildings,
    href: "/admin/departments",
  },
  {
    navlabel: true,
    subheader: "Settings",
  },
  {
    id: uniqueId(),
    title: "Settings",
    icon: IconSettings,
    href: "/admin/settings",
  },
];

export default Menuitems;
