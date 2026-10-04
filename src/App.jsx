import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./App.css";

function App() {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stopListening = onSnapshot(
      doc(db, "rooms", "room1"),
      (snapshot) => {
        if (snapshot.exists()) {
          setRoom(snapshot.data());
          setError("");
        } else {
          setRoom(null);
          setError("방 정보가 없습니다.");
        }
      },
      () => {
        setError("상태 정보를 받아오지 못했습니다.");
      }
    );

    return () => stopListening();
  }, []);

  if (error) return <p>{error}</p>;
  if (!room) return <p>상태를 불러오는 중입니다.</p>;

return (
  <main className="roomlink">
    <header className="page-header">
      <span className="app-label">ROOMLINK</span>
      <h1>룸링크</h1>
      <p>우리 방의 소식을 한눈에 확인하세요.</p>
    </header>

    <div className="roommate-list">
      <section className="roommate-card">
        <div className="avatar">A</div>
        <h2>룸메이트 A</h2>

        <p className={`status ${room.isHomeA ? "home" : "away"}`}>
          <span className="status-dot" />
          <p>{room.isHomeA ? "🟢 재실 추정" : "🔴 외출 추정"}</p>
        </p>
      </section>

      <section className="roommate-card">
        <div className="avatar">B</div>
        <h2>룸메이트 B</h2>

        <p className={`status ${room.isHomeB ? "home" : "away"}`}>
          <span className="status-dot" />
          <p>{room.isHomeB ? "🟢 재실 추정" : "🔴 외출 추정"}</p>
        </p>
      </section>
    </div>

    <p className="page-note">
      재실 상태는 룸메이트가 소지한 태그 신호를 바탕으로 추정합니다.
    </p>
  </main>
);
}

export default App;