import { href } from "react-router";
import type { Route } from "../src/routes/bbs/+types/view";
href("/bbs/:board/:postId/view", { board: "feedback", postId: "1" });
// @ts-expect-error Route parameter postId is required.
href("/bbs/:board/:postId/view", { board: "feedback" });
// @ts-expect-error Unknown routes must not silently compile.
href("/this-route-does-not-exist");
const params: Route.ComponentProps["params"] = { board: "feedback", postId: "1" };
void params;
