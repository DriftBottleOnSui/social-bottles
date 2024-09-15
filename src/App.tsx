import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Spinner } from "@nextui-org/react";

// 动态导入页面组件
const IndexPage = lazy(() => import("@/pages/index"));
const BottlesPage = lazy(() => import("@/pages/bottles"));
const MorePage = lazy(() => import("@/pages/more"));

function App() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen bg-black">
            <Spinner color="danger" size="lg" />
          </div>
        }
      >
        <Routes>
          <Route element={<IndexPage />} path="/" />
          <Route element={<BottlesPage />} path="/bottles" />
          <Route element={<MorePage />} path="/more" />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
