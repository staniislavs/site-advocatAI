import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  // Admin Routes
  route("admin", "admin/layouts/AdminLayout.tsx", [
    index("admin/pages/AdminDashboard.tsx"),
    route("leads", "admin/pages/AdminLeads.tsx"),
    route("content", "admin/pages/AdminContent.tsx"),
    route("calendar", "admin/pages/AdminCalendar.tsx"),
    route("media", "admin/pages/AdminMedia.tsx"),
    route("analytics", "admin/pages/AdminAnalytics.tsx"),
    route("email", "admin/pages/AdminEmail.tsx"),
    route("seo", "admin/pages/AdminSEO.tsx"),
    route("blocks", "admin/pages/AdminBlocks.tsx"),
    route("block-content", "admin/pages/AdminBlockContent.tsx"),
    route("admins", "admin/pages/AdminAdmins.tsx"),
    route("backup", "admin/pages/AdminBackup.tsx"),
    route("settings", "admin/pages/AdminSettings.tsx"),
  ]),
  
  route("admin/login", "admin/pages/AdminLogin.tsx"),

  // Root redirect handled in root.tsx or index route
  index("routes/home-redirect.tsx"),

  // Client Routes
  route(":lang", "routes/home.tsx"),
  route(":lang/:page", "routes/dispatcher.tsx", { id: "dispatcher-1" }),
  route(":lang/:page/:category", "routes/dispatcher.tsx", { id: "dispatcher-2" }),
  route(":lang/:page/:category/:slug", "routes/dispatcher.tsx", { id: "dispatcher-3" }),
  route(":lang/:page/:id", "routes/dispatcher.tsx", { id: "dispatcher-4" }),

] satisfies RouteConfig;
