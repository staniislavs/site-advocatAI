import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function HomeRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const browserLang = (navigator.language || "uk").toLowerCase();
    const preferredLang = browserLang.startsWith("en") ? "en" :
                          browserLang.startsWith("de") ? "de" :
                          browserLang.startsWith("ru") ? "ru" : "uk";
    navigate(`/${preferredLang}`, { replace: true });
  }, [navigate]);

  return null;
}
