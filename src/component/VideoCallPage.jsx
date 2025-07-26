import React, { useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const APP_ID = 925009695;
const SERVER_SECRET = '799364b76389affb5240b656051b4f8f';


export default function VideoCallPage() {
  const { callID } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return navigate('/');

    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID, SERVER_SECRET, callID, user.uid, user.displayName || user.email
    );
    const zp = ZegoUIKitPrebuilt.create(token);

    zp.joinRoom({
      container: document.getElementById('zego-call'),
      scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall }
    });

    return () => zp.destroy();
  }, [callID, navigate]);

  return (
    <div id="zego-call" style={{ width: '100vw', height: '100vh' }} />
  );
}
