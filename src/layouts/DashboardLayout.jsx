import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import SideNavigation from "../components/SideNavigation";
import ViewHeader from "../components/ViewHeader";
import { dashboards, pathViewMap } from "../lib/canteenData";
import { useCanteen } from "../context/CanteenContext";

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const canteen = useCanteen();
  const { setProfileOpen, setCartSheetOpen, setHistoryOpen } = canteen;

  const activeView = pathViewMap[location.pathname] ?? null;
  const activeDashboard = dashboards.find(
    (dashboard) => dashboard.id === activeView,
  );

  useEffect(() => {
    setProfileOpen(false);
    setCartSheetOpen(false);
    if (activeView !== "customer") {
      setHistoryOpen(false);
    }
  }, [activeView, setCartSheetOpen, setHistoryOpen, setProfileOpen]);

  if (!activeView || !activeDashboard) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="app-workspace">
      <SideNavigation
        activeView={activeView}
        dashboardTitle={activeDashboard.title}
        theme={canteen.theme}
        queueCount={canteen.queueOrders.length}
        cartCount={canteen.cartItems.length}
        profileOpen={canteen.profileOpen}
        cartOpen={canteen.cartSheetOpen}
        onGoHome={() => navigate("/")}
        onToggleTheme={canteen.toggleTheme}
        onToggleCartSheet={() => {
          canteen.setCartSheetOpen((current) => !current);
          canteen.setProfileOpen(false);
        }}
        onToggleProfile={() => {
          canteen.setProfileOpen((current) => !current);
          canteen.setCartSheetOpen(false);
        }}
        onOpenHistory={() => {
          canteen.setHistoryOpen(true);
          canteen.setProfileOpen(false);
        }}
        onAccountClick={() => {
          canteen.setProfileOpen(false);
          canteen.showToast("Profile details are stubbed in this demo.");
        }}
      />
      <section className="content-shell">
        <ViewHeader
          activeView={activeView}
          dashboardTitle={activeDashboard.title}
          queueCount={canteen.queueOrders.length}
        />
        <section className="view-shell">
          <Outlet />
        </section>
      </section>
    </section>
  );
}

export default DashboardLayout;
