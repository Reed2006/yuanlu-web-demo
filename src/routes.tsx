import { Navigate, createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Journey } from "./views/Journey";
import { Community } from "./views/Community";
import { Memory } from "./views/Memory";
import { TravelDetail } from "./views/TravelDetail";

/**
 * Demo版路由 - 无需认证，直接进入主界面
 */
export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Journey },
      { path: "community", Component: Community },
      { path: "memory", Component: Memory },
      { path: "travel/:travelId", Component: TravelDetail },
    ],
  },
  // 兼容旧的认证路由，全部重定向到首页
  { path: "/auth", element: <Navigate to="/" replace /> },
  { path: "/welcome", element: <Navigate to="/" replace /> },
]);
