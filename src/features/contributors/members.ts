type Member = {
  name: string;
  description: string;
  period: string;
  profile: string;
  homepage: string;
};

const contributors: Member[] = [
  {
    name: "23기 고승한",
    description: "이디저디 2.0 기획 및 프론트/백 엔드 개발을 했습니다.",
    period: "2022 ~ 2024.02.29.",
    profile: "https://avatars.githubusercontent.com/VriskaSerket51",
    homepage: "https://github.com/VriskaSerket51",
  },
  {
    name: "23기 선우준",
    description: "서버 컴퓨터 관리 및 OS 구성을 했습니다.",
    period: "2022 ~ 2024.02.29.",
    profile: "https://avatars.githubusercontent.com/sunsh9876543210",
    homepage: "https://github.com/sunsh9876543210",
  },
];

export { contributors };
