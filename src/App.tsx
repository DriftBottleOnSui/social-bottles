import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import BottlesPage from "@/pages/bottles";
import MorePage from "@/pages/more";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<BottlesPage />} path="/bottles" />
      <Route element={<MorePage />} path="/more" />
    </Routes>
  );
}

export default App;
