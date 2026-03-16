import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { store } from './app/store';
import { router } from './router';
import { registerAuthCallbacks } from './api/client';
import {
  bootstrapSession,
  sessionExpired,
  sessionRefreshed,
} from './features/auth/authSlice';
import { addToast } from './features/ui/uiSlice';
import ToastViewport from './components/common/ToastViewport';
import { clearActiveSessionRoom } from './utils/sessionRoomStorage';

import './styles/global.css';

registerAuthCallbacks({
  onRefreshSuccess: (session) => {
    store.dispatch(sessionRefreshed(session));
  },
  onAuthFailure: (error) => {
    clearActiveSessionRoom();
    store.dispatch(sessionExpired());
    store.dispatch(
      addToast({
        type: 'error',
        title: 'Session expired',
        message: error?.message || 'Please sign in again.',
      }),
    );
  },
});

store.dispatch(bootstrapSession());

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
      <ToastViewport />
    </Provider>
  </StrictMode>,
);
