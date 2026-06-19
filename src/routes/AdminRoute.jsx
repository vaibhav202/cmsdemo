import { useCanteen } from "../context/CanteenContext";
import AdminView from "../views/AdminView";

function AdminRoute() {
  const canteen = useCanteen();

  return (
    <AdminView
      menuItems={canteen.menuItems}
      draftItem={canteen.draftItem}
      setDraftItem={canteen.setDraftItem}
      onAddDraftItem={canteen.addDraftItem}
      onToggleAvailability={canteen.toggleAvailability}
      onToggleArchive={canteen.toggleArchive}
    />
  );
}

export default AdminRoute;
