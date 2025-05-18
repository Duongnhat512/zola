import React, { useRef, useState, useEffect } from "react";
import socket from "../../services/Socket";

const VideoCall = ({ userId, peerId }) => {
  const localVideo = useRef();
  const remoteVideo = useRef();
  const [inCall, setInCall] = useState(false);
  const [pc, setPc] = useState(null);

  useEffect(() => {
    socket.on("call_offer", handleReceiveOffer);
    socket.on("call_answer", handleReceiveAnswer);
    socket.on("ice_candidate", handleReceiveCandidate);

    return () => {
      socket.off("call_offer", handleReceiveOffer);
      socket.off("call_answer", handleReceiveAnswer);
      socket.off("ice_candidate", handleReceiveCandidate);
    };
  }, [pc]);

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    const peerConnection = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", { to: peerId, candidate: e.candidate });
      }
    };

    peerConnection.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("initiate_call", { from: userId, to: peerId, offer });
    setPc(peerConnection);
    setInCall(true);
  };

  const handleReceiveOffer = async ({ from, offer }) => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.current.srcObject = stream;

    const peerConnection = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", { to: from, candidate: e.candidate });
      }
    };

    peerConnection.ontrack = (e) => {
      remoteVideo.current.srcObject = e.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    socket.emit("accept_call", { from: userId, to: from, answer });
    setPc(peerConnection);
    setInCall(true);
  };

  const handleReceiveAnswer = async ({ answer }) => {
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleReceiveCandidate = async ({ candidate }) => {
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const endCall = () => {
    if (pc) pc.close();
    setInCall(false);
    socket.emit("end_call", { from: userId, to: peerId });
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="flex space-x-3">
        <video ref={localVideo} autoPlay muted className="w-48 rounded bg-black" />
        <video ref={remoteVideo} autoPlay className="w-48 rounded bg-black" />
      </div>
      {!inCall ? (
        <button
          onClick={startCall}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Bắt đầu gọi
        </button>
      ) : (
        <button
          onClick={endCall}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Kết thúc
        </button>
      )}
    </div>
  );
};

export default VideoCall;
