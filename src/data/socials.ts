export interface SocialLink {
  name: string;
  icon: string;
  darkIcon?: string;
  href: string;
}

export const socials: SocialLink[] = [
  {
    name: "Github",
    icon: "/social/github.svg",
    darkIcon: "/social/github-dark.svg",
    href: "https://github.com/sam-k99",
  },
  {
    name: "X",
    icon: "/social/x.svg",
    darkIcon: "/social/x-dark.svg",
    href: "https://x.com/",
  },
  {
    name: "Linkedin",
    icon: "/social/linkedin.svg",
    darkIcon: "/social/linkedin-dark.svg",
    href: "https://linkedin.com/in/sam-k99",
  },
  {
    name: "Gmail",
    icon: "/social/gmail.svg",
    href: "mailto:sameerkhan.2h04@gmail.com",
  },
  {
    name: "Leetcode",
    icon: "/social/leetcode.svg",
    href: "https://leetcode.com/",
  },
  {
    name: "Medium",
    icon: "/social/medium.svg",
    href: "https://medium.com/@rugalass",
  },

];
