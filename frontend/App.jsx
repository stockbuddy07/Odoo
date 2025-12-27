import { useState } from "react";
import Kanban from "./pages/Kanban";
import AppLayout from "./components/AppLayout";

export default function App() {
  const [dark, setDark] = useState(false);

  return (
    <AppLayout dark={dark} toggleDark={() => setDark(!dark)}>
      <Kanban />
    </AppLayout>
  );
}
