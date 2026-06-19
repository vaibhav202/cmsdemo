import { CanteenProvider } from "./context/CanteenContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <CanteenProvider>
      <AppRoutes />
    </CanteenProvider>
  );
}

export default App;
