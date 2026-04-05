import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Starting AcadPlan application...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: white;
    color: #dc2626;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 20px;
    text-align: center;
  `;
  errorDiv.innerHTML = '<div><h1 style="margin: 0 0 10px 0; font-size: 24px;">⚠️ Error: Root element not found</h1><p style="margin: 0; font-size: 16px;">The application container could not be found in the HTML.</p></div>';
  document.body.appendChild(errorDiv);
  throw new Error("Root element with id 'root' not found in HTML");
}

console.log("✓ Root element found, creating React root");

try {
  const root = createRoot(rootElement);
  console.log("✓ React root created, rendering App");
  root.render(<App />);
  console.log("✓ App rendered successfully");
} catch (error) {
  console.error("❌ Error rendering App:", error);
  
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: white;
    color: #dc2626;
    font-family: system-ui, -apple-system, sans-serif;
    padding: 20px;
  `;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  errorDiv.innerHTML = `
    <div style="text-align: center; max-width: 500px;">
      <h1 style="margin: 0 0 10px 0; font-size: 24px;">❌ Error Loading Application</h1>
      <p style="margin: 10px 0; font-size: 16px; color: #666;">
        ${errorMessage}
      </p>
      <p style="margin: 20px 0 0 0; font-size: 14px; color: #999;">
        Please refresh the page or contact support
      </p>
    </div>
  `;
  
  document.body.innerHTML = '';
  document.body.appendChild(errorDiv);
}
