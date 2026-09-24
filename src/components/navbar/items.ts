import { Permission } from "@/features/auth/token";

export const headerItems = [
  {
    color: "primary.main",
    title: "특별실",
    menu: [
      {
        title: "특별실 신청",
        href: "/specialroom/apply",
        permission: Permission.Student,
      },
      {
        title: "특별실 신청 현황",
        href: "/specialroom/status",
        permission: Permission.Student,
      },
      {
        title: "특별실 신청 관리",
        href: "/specialroom/management",
        permission: Permission.Teacher,
      },
      // {
      //     title: "학생 외박 관리",
      //     href: "/specialroom/outer",
      //     permission: Permission.Teacher,
      // },
      // {
      //     title: "학생활동실 사용 신청",
      //     href: "/",
      //     permission: 1,
      // },
      {
        title: "출석부 다운로드",
        href: "/attendance/info",
        permission: Permission.Student,
      },
    ],
  },
  {
    color: "primary.main",
    title: "유틸리티",
    menu: [
      {
        title: "이디봇",
        href: "/chat/idbot",
        permission: Permission.Student,
        newTab: true,
      },
      {
        title: "공학용 계산기",
        href: "/numworks/simulator.html",
        permission: Permission.Student,
        newTab: true,
      },
      {
        title: "유저 관리",
        href: "/dev/user",
        permission: Permission.Dev,
      },
    ],
  },
  {
    color: "primary.main",
    title: "피드백",
    href: "/bbs/feedback/list",
    permission: Permission.Student,
  },
];
