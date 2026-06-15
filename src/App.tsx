import { useEffect, useState } from "react";
import { Shell } from "./components/Shell";
import { Home } from "./pages/Home";
import { Pipeline } from "./pages/Pipeline";
import { Predict } from "./pages/Predict";
import { ResearchInsights } from "./pages/ResearchInsights";

function getCurrentPath() {
  const path = window.location.pathname;
  if (path === "/detect" || path === "/research" || path === "/pipeline") return path;
  if (path === "/predict") return "/detect";
  return "/";
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(getCurrentPath);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(getCurrentPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(path: string) {
    window.history.pushState({}, "", path);
    setCurrentPath(getCurrentPath());
  }

  return (
    <Shell currentPath={currentPath} onNavigate={navigate}>
      {currentPath === "/detect" ? <Predict /> : null}
      {currentPath === "/research" ? <ResearchInsights /> : null}
      {currentPath === "/pipeline" ? <Pipeline /> : null}
      {currentPath === "/" ? <Home onNavigate={navigate} /> : null}
    </Shell>
  );
}
