import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App.jsx";
import { store } from "./app/store";
import ToastHost from "./ui/ToastHost.jsx";
import { attachApiInterceptors } from "./api/apiClient.js";

attachApiInterceptors();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastHost />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);