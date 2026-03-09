import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './app/store';
import { router } from './app/router';
import { setupHttpInterceptors } from './lib/http';
import { tokensRefreshed, forceLogout } from './features/auth/authSlice';
import { selectAuthSnapshot } from './features/auth/selectors';
import { ToastProvider } from './components/ui/ToastProvider';
import './index.css';

setupHttpInterceptors({
  getAccessToken: () => selectAuthSnapshot(store.getState()).accessToken,
  getRefreshToken: () => selectAuthSnapshot(store.getState()).refreshToken,
  onTokensUpdated: (tokens) => store.dispatch(tokensRefreshed(tokens)),
  onUnauthorized: () => store.dispatch(forceLogout()),
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </Provider>
  </React.StrictMode>,
);
