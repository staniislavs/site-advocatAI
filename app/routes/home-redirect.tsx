import { redirect } from "react-router";
import type { Route } from "./+types/home-redirect";

export function loader({ request }: Route.LoaderArgs) {
  // Get preferred language from headers or default to uk
  const acceptLanguage = request.headers.get("accept-language");
  const preferredLang = acceptLanguage?.includes("en") ? "en" : 
                        acceptLanguage?.includes("de") ? "de" : 
                        acceptLanguage?.includes("ru") ? "ru" : "uk";
                        
  return redirect(`/${preferredLang}`);
}
