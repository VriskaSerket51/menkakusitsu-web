import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route("attendance", "routes/attendance/index.tsx"),
    route("attendance/download", "routes/attendance/download.tsx"),
    route("attendance/info", "routes/attendance/info.tsx"),
    route("auth", "routes/auth/index.tsx"),
    route("auth/login", "routes/auth/login.tsx"),
    route("auth/register", "routes/auth/register.tsx"),
    route("bbs", "routes/bbs/index.tsx"),
    route("bbs/:board/list", "routes/bbs/list.tsx"),
    route("bbs/:board/create", "routes/bbs/create.tsx"),
    route("bbs/:board/:postId/view", "routes/bbs/view.tsx"),
    route("bbs/:board/:postId/edit", "routes/bbs/edit.tsx"),
    route("chat", "routes/chat/index.tsx"),
    route("chat/idbot", "routes/chat/idbot.tsx"),
    route("construct", "routes/construct.tsx"),
    route("contributors", "routes/contributors/index.tsx"),
    route("dev", "routes/dev/index.tsx"),
    route("dev/user", "routes/dev/user.tsx"),
    route("specialroom", "routes/specialroom/index.tsx"),
    route("specialroom/apply", "routes/specialroom/apply.tsx"),
    route("specialroom/management", "routes/specialroom/management.tsx"),
    route("specialroom/status", "routes/specialroom/status.tsx"),
    route("setting", "routes/setting/layout.tsx", [
      index("routes/setting/index.tsx"),
      route("account", "routes/setting/account.tsx"),
    ]),
    route("*", "routes/not-found.tsx"),
  ]),
] satisfies RouteConfig;
