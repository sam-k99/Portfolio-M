export type Contribution = {
  id: string;
  title: string;
  description: string;
  link: string;
  status: "Merged" | "Open" | "Closed";
  date: string;
};

export type OpenSourceProject = {
  name: string;
  slug: string;
  logoLight: string;
  logoDark: string;
  link: string;
  description: string;
  prs: Contribution[];
  issues: Contribution[];
};

export const openSourceProjects: OpenSourceProject[] = [
  {
    name: "Impala",
    slug: "impala",
    logoLight: "/images/opensource/impala3.png",
    logoDark: "/images/opensource/impala3.png",
    link: "https://github.com/sam-k99/s",
    description: "A TUI wifi manager for linux/arch ",
    prs: [
      {
        id: "69",
        title: "feature: Visual graph ",
        description: "Feature: It shows min, avg, max speed with graph and how long wifi is connected to devices",
        link: "https://github.com/sam-k99/wi-tui",

        status: "Merged",
        date: "Aug 2026",
      }
    ],
    issues: [],
  },

  {
    name: "GM Hyprland",
    slug: "gmhyprland",
    logoLight: "/images/opensource/hyprland.png",
    logoDark: "/images/opensource/hyprland.png",
    link: "https://github.com/sam-k99/glass-minimal-hyprland",
    description: "A full hyprland setup",
    prs: [
      {
        id: "11734",
        title: "add: added many new config",
        description: "Build a full hyprland working from scratch. Ready to install one click",
        link: "https://github.com/sam-k99/glass-minimal-hyprland",
        status: "Open",
        date: "Jul 2026",
      }
    ],
    issues: [
      {
        id: "11731",
        title: "Added pywal16 support ",
        description: "Now supports pywal16 all across desktop",
        link: "https://github.com/sam-k99/glass-minimal-hyprland",
        status: "Open",
        date: "Jul 2026",
      },
      {
        id: "11730",
        title: "Liquid glass waybar",
        description: "added new waybar style",
        link: "https://github.com/sam-k99/glass-minimal-hyprland",
        status: "Open",
        date: "Jul 2026",
      },
    ],
  }
];

