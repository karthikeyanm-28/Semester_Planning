import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Starting application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  document.body.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100vh; background:white; color:red; font-family:Arial;">Error: Root element not found</div>';
  throw new Error("Root element with id 'root' not found in HTML");
}

console.log("Root element found, creating React root");

try {
  const root = createRoot(rootElement);
  console.log("React root created, rendering App");
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Error rendering App:", error);
  document.body.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100vh; background:white; color:red; font-family:Arial; padding:20px;"><div><h1>Error Loading Application</h1><p>${error instanceof Error ? error.message : String(error)}</p></div></div>`;
}


