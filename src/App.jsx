import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import "./App.css";

function App() {
  // 로그인 관련 상태
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 재실 상태
  const [room, setRoom] = useState({
    isHomeA: null,
    isHomeB: null,
  });

  const [roomReady, setRoomReady] = useState(false);

  const [connectionMessage, setConnectionMessage] = useState(
    "로그인 상태를 확인하는 중입니다."
  );

  // 입력 중인 예정 시간
  const [returnTimeA, setReturnTimeA] = useState("");
  const [returnTimeB, setReturnTimeB] = useState("");

  // Firebase에서 받아온 예정 시간
  const [savedReturnTimeA, setSavedReturnTimeA] = useState("");
  const [savedReturnTimeB, setSavedReturnTimeB] = useState("");

  // 입력 중인 예정 종류
  const [planTypeA, setPlanTypeA] = useState("귀가 예정");
  const [planTypeB, setPlanTypeB] = useState("귀가 예정");

  // Firebase에서 받아온 예정 종류
  const [savedPlanTypeA, setSavedPlanTypeA] = useState("");
  const [savedPlanTypeB, setSavedPlanTypeB] = useState("");

  // 저장·취소 처리 중인지 확인
  const [isSavingA, setIsSavingA] = useState(false);
  const [isSavingB, setIsSavingB] = useState(false);

  // 저장·취소 결과 안내
  const [planMessageA, setPlanMessageA] = useState("");
  const [planMessageB, setPlanMessageB] = useState("");

  // 로그인 상태 확인 및 Firebase 실시간 수신
  useEffect(() => {
    let stopListening = null;

    const stopAuthListening = onAuthStateChanged(
      auth,
      (currentUser) => {
        // 이전 데이터 수신 해제
        if (stopListening) {
          stopListening();
          stopListening = null;
        }

        setUser(currentUser);
        setAuthChecking(false);
        setRoomReady(false);

        setRoom({
          isHomeA: null,
          isHomeB: null,
        });

        // 이전 계정의 예정 정보와 입력값 초기화
        setReturnTimeA("");
        setReturnTimeB("");
        setSavedReturnTimeA("");
        setSavedReturnTimeB("");
        setPlanTypeA("귀가 예정");
        setPlanTypeB("귀가 예정");
        setSavedPlanTypeA("");
        setSavedPlanTypeB("");
        setPlanMessageA("");
        setPlanMessageB("");

        if (!currentUser) {
          setConnectionMessage("로그인해 주세요.");
          return;
        }

        setConnectionMessage("방 정보를 불러오는 중입니다.");

        stopListening = onSnapshot(
          doc(db, "rooms", "room1"),
          (snapshot) => {
            if (!snapshot.exists()) {
              setRoomReady(false);

              setRoom({
                isHomeA: null,
                isHomeB: null,
              });

              setSavedReturnTimeA("");
              setSavedReturnTimeB("");
              setSavedPlanTypeA("");
              setSavedPlanTypeB("");

              setConnectionMessage("등록된 방 정보가 없습니다.");
              return;
            }

            const data = snapshot.data();

            // 재실 정보
            setRoom({
              isHomeA:
                typeof data.isHomeA === "boolean"
                  ? data.isHomeA
                  : null,
              isHomeB:
                typeof data.isHomeB === "boolean"
                  ? data.isHomeB
                  : null,
            });

            // 저장된 예정 정보
            setSavedPlanTypeA(
              typeof data.planTypeA === "string"
                ? data.planTypeA
                : ""
            );

            setSavedReturnTimeA(
              typeof data.planTimeA === "string"
                ? data.planTimeA
                : ""
            );

            setSavedPlanTypeB(
              typeof data.planTypeB === "string"
                ? data.planTypeB
                : ""
            );

            setSavedReturnTimeB(
              typeof data.planTimeB === "string"
                ? data.planTimeB
                : ""
            );

            setRoomReady(true);
            setConnectionMessage("방 정보를 받아왔습니다.");
          },
          (error) => {
            console.error("Firestore 읽기 오류:", error);

            setRoomReady(false);

            setRoom({
              isHomeA: null,
              isHomeB: null,
            });

            setSavedReturnTimeA("");
            setSavedReturnTimeB("");
            setSavedPlanTypeA("");
            setSavedPlanTypeB("");

            setConnectionMessage(
              `방 정보를 받아오지 못했습니다. (${error.code})`
            );
          }
        );
      },
      (error) => {
        console.error("로그인 상태 확인 오류:", error);
        setAuthChecking(false);
        setRoomReady(false);
        setConnectionMessage("로그인 상태를 확인하지 못했습니다.");
      }
    );

    return () => {
      stopAuthListening();

      if (stopListening) {
        stopListening();
      }
    };
  }, []);

  // 로그인
  async function handleLogin(event) {
    event.preventDefault();

    setLoginError("");
    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      setPassword("");
    } catch (error) {
      console.error("로그인 오류:", error);
      setLoginError(`로그인에 실패했습니다. (${error.code})`);
    } finally {
      setIsLoggingIn(false);
    }
  }

  // 로그아웃
  async function handleLogout() {
    setLoginError("");

    try {
      await signOut(auth);
      setPassword("");
    } catch (error) {
      console.error("로그아웃 오류:", error);
      setLoginError("로그아웃하지 못했습니다.");
    }
  }

  // A의 예정 정보 저장
  async function saveReturnTimeA() {
    if (!auth.currentUser || !roomReady || isSavingA) {
      return;
    }

    setPlanMessageA("");

    const selectedTime = new Date(returnTimeA).getTime();

    if (!returnTimeA || !Number.isFinite(selectedTime)) {
      setPlanMessageA("올바른 날짜와 시간을 선택해 주세요.");
      return;
    }

    if (selectedTime <= Date.now()) {
      setPlanMessageA("현재보다 이후의 시간을 선택해 주세요.");
      return;
    }

    setIsSavingA(true);

    try {
      await updateDoc(doc(db, "rooms", "room1"), {
        planTypeA: planTypeA,
        planTimeA: returnTimeA,
      });

      setPlanMessageA("예정 정보를 Firebase에 저장했습니다.");
    } catch (error) {
      console.error("A 예정 저장 오류:", error);
      setPlanMessageA(`저장하지 못했습니다. (${error.code})`);
    } finally {
      setIsSavingA(false);
    }
  }

  // B의 예정 정보 저장
  async function saveReturnTimeB() {
    if (!auth.currentUser || !roomReady || isSavingB) {
      return;
    }

    setPlanMessageB("");

    const selectedTime = new Date(returnTimeB).getTime();

    if (!returnTimeB || !Number.isFinite(selectedTime)) {
      setPlanMessageB("올바른 날짜와 시간을 선택해 주세요.");
      return;
    }

    if (selectedTime <= Date.now()) {
      setPlanMessageB("현재보다 이후의 시간을 선택해 주세요.");
      return;
    }

    setIsSavingB(true);

    try {
      await updateDoc(doc(db, "rooms", "room1"), {
        planTypeB: planTypeB,
        planTimeB: returnTimeB,
      });

      setPlanMessageB("예정 정보를 Firebase에 저장했습니다.");
    } catch (error) {
      console.error("B 예정 저장 오류:", error);
      setPlanMessageB(`저장하지 못했습니다. (${error.code})`);
    } finally {
      setIsSavingB(false);
    }
  }

  // A의 예정 정보 취소
  async function cancelPlanA() {
    if (!auth.currentUser || !roomReady || isSavingA) {
      return;
    }

    setPlanMessageA("");
    setIsSavingA(true);

    try {
      await updateDoc(doc(db, "rooms", "room1"), {
        planTypeA: "",
        planTimeA: "",
      });

      setReturnTimeA("");
      setPlanTypeA("귀가 예정");
      setPlanMessageA("예정 정보를 취소했습니다.");
    } catch (error) {
      console.error("A 예정 취소 오류:", error);
      setPlanMessageA(`취소하지 못했습니다. (${error.code})`);
    } finally {
      setIsSavingA(false);
    }
  }

  // B의 예정 정보 취소
  async function cancelPlanB() {
    if (!auth.currentUser || !roomReady || isSavingB) {
      return;
    }

    setPlanMessageB("");
    setIsSavingB(true);

    try {
      await updateDoc(doc(db, "rooms", "room1"), {
        planTypeB: "",
        planTimeB: "",
      });

      setReturnTimeB("");
      setPlanTypeB("귀가 예정");
      setPlanMessageB("예정 정보를 취소했습니다.");
    } catch (error) {
      console.error("B 예정 취소 오류:", error);
      setPlanMessageB(`취소하지 못했습니다. (${error.code})`);
    } finally {
      setIsSavingB(false);
    }
  }

  // 저장된 날짜·시간을 읽기 편하게 변환
  function formatTime(value) {
    if (!value) {
      return "등록된 시간이 없어요.";
    }

    const date = new Date(value);

    if (!Number.isFinite(date.getTime())) {
      return "저장된 날짜 형식을 확인해 주세요.";
    }

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <main className="roomlink">
      <header className="page-header">
        <span className="app-label">ROOMLINK</span>
        <h1>룸링크</h1>
        <p>우리 방의 소식을 한눈에 확인하세요.</p>
      </header>

      <p role="status">{connectionMessage}</p>

      {loginError && <p role="alert">{loginError}</p>}

      {/* 로그인하지 않은 경우 */}
      {!authChecking && !user && (
        <section>
          <h2>로그인</h2>

          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="login-email">이메일</label>

              <input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password">비밀번호</label>

              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "로그인 중…" : "로그인"}
            </button>
          </form>
        </section>
      )}

      {/* 로그인한 경우 */}
      {!authChecking && user && (
        <>
          <div>
            <p>로그인 계정: {user.email}</p>

            <button
              type="button"
              disabled={isSavingA || isSavingB}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>

          <div className="roommate-list">
            {/* 룸메이트 A */}
            <section className="roommate-card">
              <div className="avatar">A</div>
              <h2>룸메이트 A</h2>

              <p
                className={`status ${
                  room.isHomeA === null
                    ? "unknown"
                    : room.isHomeA
                      ? "home"
                      : "away"
                }`}
              >
                <span className="status-dot" aria-hidden="true" />

                {room.isHomeA === null
                  ? "상태 확인 전"
                  : room.isHomeA
                    ? "재실 추정"
                    : "외출 추정"}
              </p>

              <div>
                <label htmlFor="plan-type-a">예정 종류</label>

                <select
                  id="plan-type-a"
                  value={planTypeA}
                  disabled={!roomReady || isSavingA}
                  onChange={(event) => {
                    setPlanTypeA(event.target.value);
                    setPlanMessageA("");
                  }}
                >
                  <option value="귀가 예정">귀가 예정</option>
                  <option value="외출 예정">외출 예정</option>
                </select>
              </div>

              <div>
                <label htmlFor="return-time-a">
                  예정 날짜와 시간
                </label>

                <input
                  id="return-time-a"
                  type="datetime-local"
                  value={returnTimeA}
                  disabled={!roomReady || isSavingA}
                  onChange={(event) => {
                    setReturnTimeA(event.target.value);
                    setPlanMessageA("");
                  }}
                />

                <button
                  type="button"
                  disabled={
                    !returnTimeA || !roomReady || isSavingA
                  }
                  onClick={saveReturnTimeA}
                >
                  {isSavingA ? "처리 중…" : "저장"}
                </button>

                <button
                  type="button"
                  disabled={
                    !savedReturnTimeA || !roomReady || isSavingA
                  }
                  onClick={cancelPlanA}
                >
                  예정 취소
                </button>

                <p>
                  {savedPlanTypeA || "예정 정보"}:{" "}
                  {formatTime(savedReturnTimeA)}
                </p>

                <p role="status">{planMessageA}</p>
              </div>
            </section>

            {/* 룸메이트 B */}
            <section className="roommate-card">
              <div className="avatar">B</div>
              <h2>룸메이트 B</h2>

              <p
                className={`status ${
                  room.isHomeB === null
                    ? "unknown"
                    : room.isHomeB
                      ? "home"
                      : "away"
                }`}
              >
                <span className="status-dot" aria-hidden="true" />

                {room.isHomeB === null
                  ? "상태 확인 전"
                  : room.isHomeB
                    ? "재실 추정"
                    : "외출 추정"}
              </p>

              <div>
                <label htmlFor="plan-type-b">예정 종류</label>

                <select
                  id="plan-type-b"
                  value={planTypeB}
                  disabled={!roomReady || isSavingB}
                  onChange={(event) => {
                    setPlanTypeB(event.target.value);
                    setPlanMessageB("");
                  }}
                >
                  <option value="귀가 예정">귀가 예정</option>
                  <option value="외출 예정">외출 예정</option>
                </select>
              </div>

              <div>
                <label htmlFor="return-time-b">
                  예정 날짜와 시간
                </label>

                <input
                  id="return-time-b"
                  type="datetime-local"
                  value={returnTimeB}
                  disabled={!roomReady || isSavingB}
                  onChange={(event) => {
                    setReturnTimeB(event.target.value);
                    setPlanMessageB("");
                  }}
                />

                <button
                  type="button"
                  disabled={
                    !returnTimeB || !roomReady || isSavingB
                  }
                  onClick={saveReturnTimeB}
                >
                  {isSavingB ? "처리 중…" : "저장"}
                </button>

                <button
                  type="button"
                  disabled={
                    !savedReturnTimeB || !roomReady || isSavingB
                  }
                  onClick={cancelPlanB}
                >
                  예정 취소
                </button>

                <p>
                  {savedPlanTypeB || "예정 정보"}:{" "}
                  {formatTime(savedReturnTimeB)}
                </p>

                <p role="status">{planMessageB}</p>
              </div>
            </section>
          </div>

          <p className="page-note">
            재실 상태와 예정 정보는 Firebase에서 받아 표시합니다.
            예정 정보는 저장 버튼을 눌러야 반영됩니다.
          </p>
        </>
      )}
    </main>
  );
}

export default App;