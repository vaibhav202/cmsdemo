import { useNavigate } from "react-router-dom";
import { dashboards, viewPathMap } from "../lib/canteenData";
import HomeView from "../views/HomeView";

function HomeRoute() {
  const navigate = useNavigate();

  function openDashboard(viewId) {
    navigate(viewPathMap[viewId] ?? "/");
  }

  return <HomeView dashboards={dashboards} onOpenDashboard={openDashboard} />;
}

export default HomeRoute;
