import { createHashRouter } from "react-router";
import { TravelHome } from "./screens/TravelHome";
import { ManualCreation } from "./screens/ManualCreation";
import { TravelTransition } from "./screens/TravelTransition";
import { RecordingInProgress } from "./screens/RecordingInProgress";
import { AnchorDetail } from "./screens/AnchorDetail";
import { RecordingResults } from "./screens/RecordingResults";
import { SynthesisProcess } from "./screens/SynthesisProcess";
import { TravelDiary } from "./screens/TravelDiary";
import { TravelExport } from "./screens/TravelExport";
import { ProfileHome } from "./screens/ProfileHome";

// Profile module
import { CapsuleManagement } from "./screens/profile/CapsuleManagement";
import { OceanBottleManagement } from "./screens/profile/OceanBottleManagement";
import { DiaryManagement } from "./screens/profile/DiaryManagement";
import { UserLevel } from "./screens/profile/UserLevel";
import { CityFootprint } from "./screens/profile/CityFootprint";

// Yuan module
import { YuanHome } from "./screens/yuan/YuanHome";
import { CapsuleCreate } from "./screens/yuan/CapsuleCreate";
import { CapsuleDiscovery } from "./screens/yuan/CapsuleDiscovery";
import { CapsuleARSearch } from "./screens/yuan/CapsuleARSearch";
import { CapsuleOpen } from "./screens/yuan/CapsuleOpen";
import { CapsuleTimeLock } from "./screens/yuan/CapsuleTimeLock";
import { CapsuleEcho } from "./screens/yuan/CapsuleEcho";
import { CollectiveMemory } from "./screens/yuan/CollectiveMemory";
import { BottleSend } from "./screens/yuan/BottleSend";
import { BottleReceive } from "./screens/yuan/BottleReceive";
import { BottleContent } from "./screens/yuan/BottleContent";
import { BottleTrajectory } from "./screens/yuan/BottleTrajectory";

// New pages
import { NotificationCenter } from "./screens/NotificationCenter";
import { AuthPage } from "./screens/AuthPage";
import { BottlePickup } from "./screens/yuan/BottlePickup";

// Community module
import { CommunityHome } from "./screens/community/CommunityHome";
import { CommunityPostDetail } from "./screens/community/CommunityPostDetail";
import { ShareToCommunity } from "./screens/community/ShareToCommunity";

export const router = createHashRouter([
  {
    path: "/",
    Component: TravelHome,
  },
  {
    path: "/manual",
    Component: ManualCreation,
  },
  {
    path: "/transition",
    Component: TravelTransition,
  },
  {
    path: "/recording",
    Component: RecordingInProgress,
  },
  {
    path: "/anchor/:id",
    Component: AnchorDetail,
  },
  {
    path: "/results",
    Component: RecordingResults,
  },
  {
    path: "/synthesis",
    Component: SynthesisProcess,
  },
  {
    path: "/diary",
    Component: TravelDiary,
  },
  {
    path: "/export",
    Component: TravelExport,
  },
  {
    path: "/profile",
    Component: ProfileHome,
  },
  // Profile routes
  {
    path: "/profile/capsule-management",
    Component: CapsuleManagement,
  },
  {
    path: "/profile/ocean-bottle-management",
    Component: OceanBottleManagement,
  },
  {
    path: "/profile/diary-management",
    Component: DiaryManagement,
  },
  {
    path: "/profile/user-level",
    Component: UserLevel,
  },
  {
    path: "/profile/city-footprint",
    Component: CityFootprint,
  },
  // Yuan routes
  {
    path: "/yuan",
    Component: YuanHome,
  },
  {
    path: "/yuan/capsule-create",
    Component: CapsuleCreate,
  },
  {
    path: "/yuan/capsule-discovery",
    Component: CapsuleDiscovery,
  },
  {
    path: "/yuan/capsule-ar-search",
    Component: CapsuleARSearch,
  },
  {
    path: "/yuan/capsule-open",
    Component: CapsuleOpen,
  },
  {
    path: "/yuan/capsule-timelock",
    Component: CapsuleTimeLock,
  },
  {
    path: "/yuan/capsule-echo",
    Component: CapsuleEcho,
  },
  {
    path: "/yuan/collective-memory",
    Component: CollectiveMemory,
  },
  {
    path: "/yuan/bottle-send",
    Component: BottleSend,
  },
  {
    path: "/yuan/bottle-receive",
    Component: BottlePickup, // BottleReceive was static demo, redirect to real pickup
  },
  {
    path: "/yuan/bottle-content",
    Component: BottleContent,
  },
  {
    path: "/yuan/bottle-trajectory",
    Component: BottleTrajectory,
  },
  // New routes
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/notifications",
    Component: NotificationCenter,
  },
  {
    path: "/yuan/bottle-pickup",
    Component: BottlePickup,
  },
  // Community routes
  {
    path: "/community",
    Component: CommunityHome,
  },
  {
    path: "/community/post/:postId",
    Component: CommunityPostDetail,
  },
  {
    path: "/community/share",
    Component: ShareToCommunity,
  },
]);
