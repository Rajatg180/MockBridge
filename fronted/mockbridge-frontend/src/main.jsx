import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";
import ToastHost from "./ui/ToastHost";
import { attachApiInterceptors } from "./api/apiClient";

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