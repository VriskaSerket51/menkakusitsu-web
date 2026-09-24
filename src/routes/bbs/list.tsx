import type { Route } from "./+types/list";
import { Permission } from "@/features/auth/token";
import PostList from "@/features/bbs/post-list";

export default function ListRoute({ params }: Route.ComponentProps) {
  return <PostList board={params.board} />;
}

export const handle = { permission: Permission.Student };
