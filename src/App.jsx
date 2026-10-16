import { useState } from "react";
import "./App.css";

function App() {
  // 아직 확인되지 않은 상태는 null로 표시
  const [room] = useState({
    isHomeA: null,
    isHomeB: null,
  });

const [returnTimeA, setReturnTimeA] = useState("");
const [returnTimeB, setReturnTimeB] = useState("");

const [savedReturnTimeA, setSavedReturnTimeA] = useState("");
const [savedReturnTimeB, setSavedReturnTimeB] = useState("");


const [planTypeA, setPlanTypeA] = useState("귀가 예정");
const [savedPlanTypeA, setSavedPlanTypeA] = useState("");
const [planTypeB, setPlanTypeB] = useState("귀가 예정");
const [savedPlanTypeB, setSavedPlanTypeB] = useState("");


function saveReturnTimeA() {
  if (!returnTimeA) {
    alert("날짜와 시간을 선택해 주세요.");
    return;
  }

  if (new Date(returnTimeA).getTime() <= Date.now()) {
    alert("현재보다 이후의 시간을 선택해 주세요.");
    return;
  }

  setSavedReturnTimeA(returnTimeA);
  setSavedPlanTypeA(planTypeA);
}


function saveReturnTimeB() {
  if (!returnTimeB) {
    alert("날짜와 시간을 선택해 주세요.");
    return;
  }

  if (new Date(returnTimeB).getTime() <= Date.now()) {
    alert("현재보다 이후의 시간을 선택해 주세요.");
    return;
  }

  setSavedReturnTimeB(returnTimeB);
  setSavedPlanTypeB(planTypeB);
}
  

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

        <p className={`status ${room.isHomeA === null ? "home" : room.isHomeA ? "home" : "away"}`}>
          <span className="status-dot" />
          {room.isHomeA === null ? "상태 확인 전" : room.isHomeA ? "재실 추정" : "외출 추정"}
        </p>

        <div>
          <label htmlFor="plan-type-a">예정 종류</label>

          <select
          id="plan-type-a"
          value={planTypeA}
          onChange={(event) => setPlanTypeA(event.target.value)}
          >
          <option value="귀가 예정">귀가 예정</option>
          <option value="외출 예정">외출 예정</option>
            </select>
        </div>


        <div>
          <label htmlFor="return-time-a">예정 날짜와 시간</label>
          <input id="return-time-a"
          type="datetime-local"
          value={returnTimeA}
          onChange={event=>setReturnTimeA(event.target.value)}
          />

          <button
          type="button"
          disabled={!returnTimeA}
          onClick={saveReturnTimeA}
          >
            저장
          </button>
          <button
          type="button"
          disabled={!savedReturnTimeA}
          onClick={()=>{
            setReturnTimeA("");
            setSavedReturnTimeA("");
            setPlanTypeA("귀가 예정");
            setSavedPlanTypeA("");
          }}
          >
            예정취소
          </button>
          <p>
            {savedPlanTypeA || "예정 정보"}:{" "}
            {savedReturnTimeA
            ? new Date(savedReturnTimeA).toLocaleString("ko-KR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          : "등록된 시간이 없어요."}
        </p>
        </div>
      </section>

      <section className="roommate-card">
        <div className="avatar">B</div>
        <h2>룸메이트 B</h2>

        <p className={`status ${room.isHomeB === null ? "away" : room.isHomeB ? "home" : "away"}`}>
          <span className="status-dot" />
          {room.isHomeB === null ? "상태 확인 전" : room.isHomeB ? "재실 추정" : "외출 추정"}
        </p>


        <div>
          <label htmlFor="plan-type-b">예정 종류</label>

          <select
          id="plan-type-b"
          value={planTypeB}
          onChange={(event) => setPlanTypeB(event.target.value)}
          >
          <option value="귀가 예정">귀가 예정</option>
          <option value="외출 예정">외출 예정</option>
            </select>
        </div>


        <div>
          <label htmlFor="return-time-b">예정 날짜와 시간</label>
          <input 
          id="return-time-b" 
          type="datetime-local"
          value={returnTimeB}
          onChange={event=>setReturnTimeB(event.target.value)}
          />
          <button
          type="button"
          disabled={!returnTimeB}
          onClick={saveReturnTimeB}
          >
            저장
          </button>
          <button
          type="button"
          disabled={!savedReturnTimeB}
          onClick={()=>{
            setReturnTimeB("");
            setSavedReturnTimeB("");
            setPlanTypeB("귀가 예정");
            setSavedPlanTypeB("");
          }}
          >
            예정취소
          </button>
          <p>
            {savedPlanTypeB || "예정 정보"}:{" "}
            {savedReturnTimeB
            ? new Date(savedReturnTimeB).toLocaleString("ko-KR", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
          : "등록된 시간이 없어요."}
          </p>
        </div>
      </section>
    </div>


    <p>선택한 시간: {returnTimeA || "아직 입력하지 않았어요."}</p>
    <p className="page-note">
      룸메이트의 재실 상태를 표시할 화면입니다.
    </p>
  </main>
);
}

export default App;
