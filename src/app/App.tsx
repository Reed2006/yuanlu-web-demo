import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppStateProvider } from "./contexts/AppStateContext";

export default function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
    </AppStateProvider>
  );
}
