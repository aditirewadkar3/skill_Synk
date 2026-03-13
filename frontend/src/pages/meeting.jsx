import * as React from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { meetingsAPI } from '@/services/api';

export default function MeetingPage() {
  const [token, setToken] = React.useState(null);
  const [roomName, setRoomName] = React.useState(null);

  React.useEffect(() => {
    // Extract roomName and token from URL
    const path = window.location.pathname;
    const match = path.match(/\/meeting\/([^/]+)/);
    let rName = null;
    if (match) {
      rName = match[1];
      setRoomName(rName);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    } else if (rName) {
      // If no token, use the join API to get one for the current user
      const fetchToken = async () => {
        try {
          const res = await meetingsAPI.join(rName);
          if (res.success && res.token) {
            setToken(res.token);
          }
        } catch (error) {
          console.error('Failed to fetch meeting token:', error);
        }
      };
      fetchToken();
    }
  }, []);

  const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://slynk-97c2whww.livekit.cloud';

  if (!token || !roomName) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center p-8 border rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Meeting Setup</h1>
          <p className="text-muted-foreground">
            {!roomName ? 'Invalid meeting room.' : 'Waiting for meeting token...'}
          </p>
          <div className="mt-6">
             <button 
               onClick={() => window.location.href = '/chat'}
               className="px-4 py-2 bg-primary text-primary-foreground rounded-md transition-colors hover:bg-primary/90"
             >
               Go back to Chat
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }} className="meeting-page">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        onDisconnected={() => {
          // If we can't close the window, go back to chat
          try {
            if (window.opener) {
              window.close();
            } else {
              window.location.href = '/chat';
            }
          } catch (e) {
            window.location.href = '/chat';
          }
        }}
        data-lk-theme="default"
        style={{ height: '100vh' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
