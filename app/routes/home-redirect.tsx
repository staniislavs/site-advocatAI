import { redirect } from "react-router";
import type { Route } from "./+types/home-redirect";

export function loader({ request }: Route.LoaderArgs) {
  return redirect('/uk');
}
