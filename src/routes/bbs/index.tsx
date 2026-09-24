import { href } from "react-router";
import { Navigate } from "react-router";

export default function IndexScreen() {
  return <Navigate to={href("/bbs/:board/list", { board: "feedback" })}  />;
}
