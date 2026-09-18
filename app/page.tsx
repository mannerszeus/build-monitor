"use client";

import { useMemo, useState } from "react";

type Status = "RUNNING" | "SUCCESS" | "FAILED" | "CANCELLED";

type Deployment = {
  id: string;
  system: string;
  build: string;
  executor: string;
  startedAt: string;
  finishedAt?: string;
  status: Status;
  stage: string;
  duration: string;
  server: string;
};

const deployments: Deployment[] = [
  { id: "DEP-20260918-0142", system: "챗봇서비스", build: "CHATBOT-DEPLOY", executor: "김재구", startedAt: "09/18 14:21:03", finishedAt: "09/18 14:25:17", status: "RUNNING", stage: "운영 배포", duration: "04:14", server: "CHATBOT-PRD" },
  { id: "DEP-20260918-0141", system: "고객DB", build: "CUSTOMER-DB", executor: "박민수", startedAt: "09/18 14:02:11", finishedAt: "09/18 14:06:48", status: "SUCCESS", stage: "배포 완료", duration: "04:37", server: "CUSTDB-PRD" },
  { id: "DEP-20260918-0140", system: "상담시스템", build: "COUNSEL-WEB", executor: "이영희", startedAt: "09/18 13:51:24", finishedAt: "09/18 13:55:08", status: "FAILED", stage: "Deploy", duration: "03:44", server: "COUNSEL-PRD" },
  { id: "DEP-20260918-0139", system: "모바일앱 API", build: "MOBILE-API", executor: "최준호", startedAt: "09/18 13:24:09", finishedAt: "09/18 13:29:31", status: "SUCCESS", stage: "배포 완료", duration: "05:22", server: "MOBILE-PRD" },
  { id: "DEP-20260918-0138", system: "인증서비스", build: "AUTH-SVC", executor: "김수진", startedAt: "09/18 12:48:51", finishedAt: "09/18 12:51:32", status: "SUCCESS", stage: "배포 완료", duration: "02:41", server: "AUTH-PRD" },
  { id: "DEP-20260918-0137", system: "통합로그조회", build: "LOG-VIEWER", executor: "정우성", startedAt: "09/18 11:37:15", finishedAt: "09/18 11:42:02", status: "CANCELLED", stage: "사용자 취소", duration: "04:47", server: "LOG-PRD" },
  { id: "DEP-20260918-0136", system: "챗봇서비스", build: "CHATBOT-FIX", executor: "홍길동", startedAt: "09/18 10:12:41", finishedAt: "09/18 10:16:18", status: "SUCCESS", stage: "배포 완료", duration: "03:37", server: "CHATBOT-PRD" }
];

const statusLabel: Record<Status, string> = {
  RUNNING: "진행중",
  SUCCESS: "성공",
  FAILED: "실패",
  CANCELLED: "취소"
};

function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status.toLowerCase()}`}>{statusLabel[status]}</span>;
}

export default function Home() {
  const [selected, setSelected] = useState<Deployment | null>(null);
  const [filter, setFilter] = useState<"ALL" | Status>("ALL");

  const filtered = useMemo(
    () => filter === "ALL" ? deployments : deployments.filter((item) => item.status === filter),
    [filter]
  );

  const counts = {
    running: deployments.filter((d) => d.status === "RUNNING").length,
    today: deployments.length,
    success: deployments.filter((d) => d.status === "SUCCESS").length,
    failed: deployments.filter((d) => d.status === "FAILED").length
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">B</div>
          <div><strong>Build Monitor</strong><span>BuildForge Operations</span></div>
        </div>
        <nav>
          <button className="nav-item active">▦ <span>대시보드</span></button>
          <button className="nav-item">↻ <span>배포 이력</span></button>
          <button className="nav-item">▣ <span>시스템 현황</span></button>
          <button className="nav-item">⚙ <span>설정</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="connection"><i /> Collector 연결 대기중</div>
          <small>UI Preview · Dummy Data</small>
        </div>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">OPERATIONS / DEPLOYMENT</p>
            <h1>배포 현황</h1>
            <p className="sub">BuildForge 배포 작업을 한 화면에서 확인하세요.</p>
          </div>
          <div className="top-actions">
            <div className="live"><i /> LIVE</div>
            <div className="avatar">김</div>
          </div>
        </header>

        <div className="dashboard">
          <section className="stat-grid">
            <StatCard title="현재 배포중" value={counts.running} unit="건" hint="실시간 작업" tone="blue" icon="▶" />
            <StatCard title="오늘 배포" value={counts.today} unit="건" hint="2026.09.18 기준" tone="purple" icon="▣" />
            <StatCard title="성공" value={counts.success} unit="건" hint="성공률 71.4%" tone="green" icon="✓" />
            <StatCard title="실패" value={counts.failed} unit="건" hint="확인 필요" tone="red" icon="!" />
          </section>

          <section className="panel">
            <div className="panel-head">
              <div><h2>최근 배포</h2><span>최근 BuildForge 실행 이력</span></div>
              <div className="filters">
                {(["ALL", "RUNNING", "SUCCESS", "FAILED", "CANCELLED"] as const).map((item) => (
                  <button key={item} onClick={() => setFilter(item)} className={filter === item ? "filter active" : "filter"}>
                    {item === "ALL" ? "전체" : statusLabel[item]}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>시스템</th><th>Build</th><th>실행자</th><th>시작시간</th><th>소요시간</th><th>단계</th><th>상태</th><th /></tr></thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} onClick={() => setSelected(item)}>
                      <td><strong>{item.system}</strong><small>{item.server}</small></td>
                      <td className="mono">{item.build}</td>
                      <td>{item.executor}</td>
                      <td className="muted">{item.startedAt}</td>
                      <td className="mono">{item.duration}</td>
                      <td>{item.stage}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td className="arrow">›</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="lower-grid">
            <div className="panel">
              <div className="panel-head compact"><div><h2>시스템별 현황</h2><span>최근 24시간</span></div></div>
              <div className="system-list">
                {[["챗봇서비스", 8, 7], ["고객DB", 5, 5], ["상담시스템", 4, 3], ["모바일앱 API", 6, 6], ["인증서비스", 3, 3]].map(([name, total, success]) => (
                  <div className="system-row" key={name as string}>
                    <div><strong>{name}</strong><span>{success}/{total} 성공</span></div>
                    <div className="progress"><i style={{ width: `${Number(success) / Number(total) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel health">
              <div className="panel-head compact"><div><h2>Collector 상태</h2><span>BuildForge 연동 준비</span></div></div>
              <div className="health-body"><div className="health-icon">↗</div><div><strong>API 연동 대기</strong><p>현재 화면은 더미 데이터로 동작합니다.</p></div></div>
              <div className="next-step">다음 단계 <b>BuildForge Collector 연결 →</b></div>
            </div>
          </section>
        </div>
      </section>

      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function StatCard({ title, value, unit, hint, tone, icon }: { title: string; value: number; unit: string; hint: string; tone: string; icon: string }) {
  return <div className={`stat-card tone-${tone}`}><div className="stat-icon">{icon}</div><div><span>{title}</span><div className="stat-value">{value}<em>{unit}</em></div><small>{hint}</small></div></div>;
}

function DetailModal({ item, onClose }: { item: Deployment; onClose: () => void }) {
  const stages = ["Checkout", "Build", "Package", "Deploy", "Verify"];
  const failedAt = item.status === "FAILED" ? item.stage : null;
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="modal-head"><div><span className="eyebrow">DEPLOYMENT DETAIL</span><h2>{item.system}</h2></div><button onClick={onClose}>×</button></div>
    <div className="detail-grid"><div><label>배포 ID</label><b className="mono">{item.id}</b></div><div><label>Build</label><b>{item.build}</b></div><div><label>실행자</label><b>{item.executor}</b></div><div><label>서버</label><b>{item.server}</b></div></div>
    <div className="stage-title"><h3>배포 진행 단계</h3><StatusBadge status={item.status} /></div>
    <div className="stages">{stages.map((stage, i) => {
      const done = item.status === "SUCCESS" || (item.status === "RUNNING" && i < 4) || (failedAt === stage);
      const active = item.status === "RUNNING" && i === 3;
      return <div className={`stage ${done ? "done" : ""} ${active ? "active" : ""} ${failedAt === stage ? "failed" : ""}`} key={stage}><span>{done ? (failedAt === stage ? "!" : "✓") : i + 1}</span><b>{stage}</b></div>;
    })}</div>
    <div className="log-box"><div className="log-head"><b>실행 로그</b><span>Dummy Log</span></div><pre>{`[14:21:03] Build started\n[14:21:08] Source checkout completed\n[14:22:31] Build completed successfully\n[14:23:04] Package created\n[14:24:11] Deploying to ${item.server}\n[14:25:17] Deployment status: ${statusLabel[item.status]}`}</pre></div>
  </div></div>;
}