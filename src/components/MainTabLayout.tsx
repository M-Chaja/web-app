import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";

/** Wraps the four tab-bar screens (Home/Wallet/Activity/Points) in a shared
 *  scroll container + persistent nav — see BottomNav.tsx. Screens pushed on
 *  top (Station Detail, Scan, Active Rental, Transaction History) are
 *  separate top-level routes without this layout, matching native's
 *  NavigationStack-pushes-over-the-tab-bar behavior. */
export function MainTabLayout() {
  return (
    <div className="flex h-full min-h-dvh flex-col bg-background">
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
