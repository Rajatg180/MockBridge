const DEFAULT_JITSI_DOMAIN = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
const SCRIPT_ID = 'mockbridge-jitsi-external-api';

let scriptPromise = null;

export function getJitsiDomain() {
  return DEFAULT_JITSI_DOMAIN;
}

export function getJitsiMeetingUrl(roomId, domain = getJitsiDomain()) {
  return `https://${domain}/${encodeURIComponent(roomId || '')}`;
}

export function loadJitsiExternalApi(domain = getJitsiDomain()) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Jitsi can only load in the browser.'));
  }

  if (window.JitsiMeetExternalAPI) {
    return Promise.resolve(window.JitsiMeetExternalAPI);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);

    if (existing) {
      existing.addEventListener('load', () => {
        if (window.JitsiMeetExternalAPI) {
          resolve(window.JitsiMeetExternalAPI);
          return;
        }

        reject(new Error('Jitsi API loaded, but the external API was not found.'));
      });

      existing.addEventListener('error', () => {
        reject(new Error('Unable to load the Jitsi Meet script.'));
      });

      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://${domain}/external_api.js`;

    script.onload = () => {
      if (window.JitsiMeetExternalAPI) {
        resolve(window.JitsiMeetExternalAPI);
        return;
      }

      reject(new Error('Jitsi API loaded, but the external API was not found.'));
    };

    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Unable to load the Jitsi Meet script.'));
    };

    document.body.appendChild(script);
  });

  return scriptPromise;
}

export function disposeJitsiApi(api) {
  if (!api) {
    return;
  }

  try {
    api.dispose();
  } catch {
    // Ignore dispose errors.
  }
}
