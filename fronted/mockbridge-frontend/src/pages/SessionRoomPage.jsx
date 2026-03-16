import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ErrorBlock from '../components/common/ErrorBlock';
import {
  clearSessionLookup,
  fetchBookingSession,
} from '../features/interview/interviewSlice';
import {
  fetchChatMessages,
  resetChatState,
  sendChatMessage,
} from '../features/chat/chatSlice';
import { addToast } from '../features/ui/uiSlice';
import { utcDateTimeToLocalLabel, utcRangeToLocalLabel } from '../utils/date';
import { getErrorMessage } from '../utils/http';
import {
  disposeJitsiApi,
  getJitsiDomain,
  getJitsiMeetingUrl,
  loadJitsiExternalApi,
} from '../utils/jitsi';
import {
  buildSessionRoomPath,
  clearActiveSessionRoom,
  loadActiveSessionRoom,
  saveActiveSessionRoom,
} from '../utils/sessionRoomStorage';

function createContextFromRoute(roomId, storedContext) {
  if (!roomId) {
    return storedContext || null;
  }

  return {
    ...(storedContext || {}),
    roomId,
  };
}

export default function SessionRoomPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const routeRoomId = decodeURIComponent(params.roomId || '');
  const authUser = useSelector((state) => state.auth.user);
  const profile = useSelector((state) => state.profile.profile);
  const sessionLookup = useSelector((state) => state.interview.sessionLookup);
  const chatState = useSelector((state) => state.chat);

  const [sessionContext, setSessionContext] = useState(() => {
    const incomingContext = location.state?.sessionContext || null;
    const storedContext = loadActiveSessionRoom();

    return incomingContext || createContextFromRoute(routeRoomId, storedContext);
  });
  const [meetingState, setMeetingState] = useState({
    status: 'idle',
    error: '',
  });
  const [meetingRetryKey, setMeetingRetryKey] = useState(0);
  const [messageInput, setMessageInput] = useState('');

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const chatMessagesEndRef = useRef(null);

  const bookingId = sessionContext?.bookingId || null;
  const effectiveRoomId = sessionContext?.roomId || routeRoomId;
  const domain = getJitsiDomain();
  const currentDisplayName = profile?.fullName || authUser?.email || 'MockBridge User';
  const currentEmail = profile?.email || authUser?.email || '';
  const currentUserId = authUser?.userId || null;

  useEffect(() => {
    const incomingContext = location.state?.sessionContext || null;

    if (incomingContext) {
      setSessionContext(incomingContext);
      saveActiveSessionRoom(incomingContext);
      return;
    }

    if (routeRoomId) {
      const nextContext = createContextFromRoute(routeRoomId, loadActiveSessionRoom());
      setSessionContext(nextContext);
      saveActiveSessionRoom(nextContext);
    }
  }, [location.state, routeRoomId]);

  useEffect(() => {
  if (!bookingId) {
    return undefined;
  }

  let isCancelled = false;

  const loadMessages = () => {
    if (isCancelled) {
      return;
    }
    dispatch(fetchChatMessages(bookingId));
  };

  loadMessages();

  const intervalId = window.setInterval(() => {
    loadMessages();
  }, 2000);

  return () => {
    isCancelled = true;
    window.clearInterval(intervalId);
  };
}, [bookingId, dispatch]);

  useEffect(() => {
    if (!effectiveRoomId || !jitsiContainerRef.current) {
      return undefined;
    }

    let cancelled = false;

    setMeetingState({
      status: 'loading',
      error: '',
    });

    loadJitsiExternalApi(domain)
      .then(() => {
        if (cancelled || !jitsiContainerRef.current) {
          return;
        }

        jitsiContainerRef.current.innerHTML = '';

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName: effectiveRoomId,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: currentDisplayName,
            email: currentEmail,
          },
          configOverwrite: {
            disableDeepLinking: true,
            enableWelcomePage: false,
            prejoinConfig: {
              enabled: false,
            },
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
          },
        });

        jitsiApiRef.current = api;
        setMeetingState({
          status: 'ready',
          error: '',
        });

        api.addEventListener('readyToClose', () => {
          if (cancelled) {
            return;
          }

          clearActiveSessionRoom();
          dispatch(clearSessionLookup());
          dispatch(resetChatState());
        });
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setMeetingState({
          status: 'failed',
          error: error?.message || 'Unable to load the Jitsi meeting.',
        });
      });

    return () => {
      cancelled = true;
      disposeJitsiApi(jitsiApiRef.current);
      jitsiApiRef.current = null;

      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = '';
      }
    };
  }, [currentDisplayName, currentEmail, dispatch, domain, effectiveRoomId, meetingRetryKey]);

  useEffect(() => {
    if (!bookingId) {
      return undefined;
    }

    dispatch(fetchChatMessages(bookingId));

    const intervalId = window.setInterval(() => {
      dispatch(fetchChatMessages(bookingId));
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [bookingId, dispatch]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.items.length]);

  useEffect(() => {
    return () => {
      dispatch(resetChatState());
    };
  }, [dispatch]);

  const counterpartLabel = useMemo(() => {
    if (sessionContext?.role === 'interviewer') {
      return 'Candidate';
    }

    return 'Interviewer';
  }, [sessionContext?.role]);

  const backTo = sessionContext?.source === 'slots' ? '/slots' : '/bookings';
  const meetingUrl = effectiveRoomId ? getJitsiMeetingUrl(effectiveRoomId, domain) : '';

  const leaveSession = () => {
    clearActiveSessionRoom();
    dispatch(clearSessionLookup());
    dispatch(resetChatState());
    navigate(backTo, { replace: true });
  };

  const refreshSession = async () => {
    if (!sessionContext?.bookingId) {
      return;
    }

    try {
      const session = await dispatch(fetchBookingSession(sessionContext.bookingId)).unwrap();
      const nextContext = {
        ...sessionContext,
        roomId: session.roomId,
        sessionStatus: session.sessionStatus,
      };

      setSessionContext(nextContext);
      saveActiveSessionRoom(nextContext);

      navigate(buildSessionRoomPath(session.roomId), {
        replace: true,
        state: {
          sessionContext: nextContext,
        },
      });

      dispatch(
        addToast({
          type: 'success',
          title: 'Session refreshed',
          message: 'The latest session status has been loaded.',
        }),
      );
    } catch (error) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Refresh failed',
          message: getErrorMessage(error, 'Unable to refresh the session.'),
        }),
      );
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const content = messageInput.trim();
    if (!content || !bookingId) {
      return;
    }

    try {
      await dispatch(sendChatMessage({ bookingId, content })).unwrap();
      setMessageInput('');
    } catch (error) {
      dispatch(
        addToast({
          type: 'error',
          title: 'Message failed',
          message: getErrorMessage(error, 'Unable to send your message.'),
        }),
      );
    }
  };

  if (!effectiveRoomId) {
    return (
      <EmptyState
        title="No active session"
        description="Open a confirmed booking or confirmed request to enter the session room."
        action={
          <Link to="/bookings" className="button button--primary">
            Go to bookings
          </Link>
        }
      />
    );
  }

  if (sessionLookup.status === 'loading' && !sessionLookup.data && !bookingId && !effectiveRoomId) {
    return <Loader label="Opening your session room..." />;
  }

  return (
    <div className="stack-lg session-room">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Live interview</p>
          <h1>Join session</h1>
          <p>Both interviewer and booked user can join this room from their dashboard.</p>
        </div>
        <div className="hero-card__actions">
          {sessionContext?.bookingId ? (
            <button type="button" className="button button--primary" onClick={refreshSession}>
              Refresh status
            </button>
          ) : null}
          {meetingUrl ? (
            <a
              href={meetingUrl}
              className="button button--ghost"
              target="_blank"
              rel="noreferrer"
            >
              Open in new tab
            </a>
          ) : null}
          <button type="button" className="button button--ghost" onClick={leaveSession}>
            Leave session
          </button>
        </div>
      </section>

      {meetingState.status === 'failed' ? (
        <ErrorBlock
          title="Unable to load the meeting"
          message={meetingState.error}
          action={
            <div className="button-row">
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  setMeetingState({
                    status: 'idle',
                    error: '',
                  });
                  setMeetingRetryKey((current) => current + 1);
                }}
              >
                Retry
              </button>
              {meetingUrl ? (
                <a
                  href={meetingUrl}
                  className="button button--ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in browser
                </a>
              ) : null}
            </div>
          }
        />
      ) : null}

      <section className="session-room__grid">
        <article className="card session-stage session-stage--live">
          <div className="card__header session-stage__header">
            <div>
              <p className="eyebrow">Meeting room</p>
              <h2>{sessionContext?.sessionStatus || sessionLookup.data?.sessionStatus || 'CREATED'}</h2>
            </div>
            <span className="badge">{effectiveRoomId}</span>
          </div>

          {meetingState.status === 'loading' ? (
            <Loader label="Loading Jitsi meeting..." />
          ) : null}

          <div ref={jitsiContainerRef} className="jitsi-container" />
        </article>

        <aside className="session-sidebar-panel">
          <article className="card stack session-sidebar">
            <div>
              <p className="eyebrow">Participants</p>
              <h2>{counterpartLabel}</h2>
            </div>

            <div className="detail-tile">
              <strong>{sessionContext?.counterpartName || counterpartLabel}</strong>
              {sessionContext?.counterpartHeadline ? (
                <p>{sessionContext.counterpartHeadline}</p>
              ) : (
                <p>{counterpartLabel} details are available from the profile service.</p>
              )}
            </div>

            <div className="detail-tile">
              <strong>Your join code</strong>
              <p>{effectiveRoomId}</p>
            </div>

            <div className="detail-tile">
              <strong>Schedule</strong>
              <p>{utcRangeToLocalLabel(sessionContext?.startTimeUtc, sessionContext?.endTimeUtc)}</p>
            </div>

            <div className="inline-note">
              This room uses the shared Jitsi meeting for the confirmed booking.
            </div>
          </article>

          <article className="card chat-panel">
            <div className="card__header chat-panel__header">
              <div>
                <p className="eyebrow">Session chat</p>
                <h2>Live conversation</h2>
              </div>
              <span className="badge">{chatState.items.length} messages</span>
            </div>

            {chatState.status === 'loading' && !chatState.items.length ? (
              <Loader label="Loading chat..." />
            ) : null}

            {chatState.status === 'failed' && chatState.error ? (
              <ErrorBlock
                title="Could not load chat"
                message={chatState.error.message}
                action={
                  bookingId ? (
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => dispatch(fetchChatMessages(bookingId))}
                    >
                      Retry
                    </button>
                  ) : null
                }
              />
            ) : null}

            <div className="chat-messages">
              {!chatState.items.length ? (
                <div className="chat-empty">
                  <p>No messages yet. Start the conversation.</p>
                </div>
              ) : (
                chatState.items.map((message) => {
                  const isOwn = message.senderUserId === currentUserId;
                  const senderLabel = isOwn
                    ? 'You'
                    : sessionContext?.counterpartName ||
                      (message.senderRole === 'INTERVIEWER' ? 'Interviewer' : 'Student');

                  return (
                    <div
                      key={message.id}
                      className={`chat-message ${isOwn ? 'chat-message--own' : ''}`}
                    >
                      <div className="chat-message__meta">
                        <strong>{senderLabel}</strong>
                        <span>{utcDateTimeToLocalLabel(message.createdAt)}</span>
                      </div>
                      <p>{message.content}</p>
                    </div>
                  );
                })
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            <form className="chat-form" onSubmit={handleSendMessage}>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Type your message..."
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                maxLength={1000}
              />
              <div className="chat-form__actions">
                <span className="chat-form__hint">{messageInput.length}/1000</span>
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={
                    !bookingId ||
                    !messageInput.trim() ||
                    chatState.sendStatus === 'loading'
                  }
                >
                  {chatState.sendStatus === 'loading' ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </article>
        </aside>
      </section>
    </div>
  );
}