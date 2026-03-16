import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// ─── Mock Data ────────────────────────────────────────
const MEMBERS = [
  "김영희","김철수","김은혜","김성민","김하늘","나은영","노병석","류미정",
  "박수진","박정훈","박민서","서영주","손지현","송태호","신혜원","안수빈",
  "유재석","이동국","이서연","이현우","장미란","전상우","정다은","조현석",
  "최윤아","최준혁","한소율","홍길동","강민호","오세진","윤지영","배성훈",
  "허정민","임수아","권도현","문채원","양승호","구자영","황태민","천서윤",
];
const MENUS = [
  { name: "아메리카노(HOT)", price: 2000, cat: "커피" },
  { name: "아메리카노(ICE)", price: 2500, cat: "커피" },
  { name: "카페라떼(HOT)", price: 3000, cat: "커피" },
  { name: "카페라떼(ICE)", price: 3500, cat: "커피" },
  { name: "바닐라라떼", price: 3500, cat: "커피" },
  { name: "카푸치노", price: 3000, cat: "커피" },
  { name: "카라멜마끼아또", price: 3500, cat: "커피" },
  { name: "녹차라떼", price: 3500, cat: "논커피" },
  { name: "유자차", price: 3000, cat: "논커피" },
  { name: "레몬에이드", price: 3500, cat: "논커피" },
  { name: "핫초코", price: 3000, cat: "논커피" },
  { name: "딸기스무디", price: 4000, cat: "논커피" },
  { name: "쿠키", price: 1500, cat: "디저트" },
  { name: "머핀", price: 2500, cat: "디저트" },
];
const PAYMENTS = ["cash", "transfer", "credit"];
const PAY_LABEL = { cash: "현금", transfer: "계좌이체", credit: "외상" };
const PAY_COLOR = { cash: "#5a9a6e", transfer: "#4a7fd4", credit: "#d49a4a" };

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}
function generateOrders() {
  const orders = []; const rand = seededRandom(42);
  const baseDate = new Date(2025, 0, 1);
  for (let day = 0; day < 365; day++) {
    const date = new Date(baseDate); date.setDate(date.getDate() + day);
    if (date.getDay() === 0) continue;
    const n = Math.floor(rand() * 12) + 5;
    for (let i = 0; i < n; i++) {
      const member = MEMBERS[Math.floor(rand() * MEMBERS.length)];
      const menu = MENUS[Math.floor(rand() * MENUS.length)];
      const qty = rand() > 0.85 ? 2 : 1;
      const payment = PAYMENTS[Math.floor(rand() * 3)];
      orders.push({
        id: `${day}-${i}`, date: date.toISOString().split("T")[0],
        month: date.getMonth() + 1, quarter: Math.floor(date.getMonth() / 3) + 1,
        week: getWeekNumber(date), member, menu: menu.name, category: menu.cat,
        qty, unitPrice: menu.price, total: menu.price * qty, payment,
      });
    }
  }
  return orders;
}
function getWeekNumber(d) {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
}
const ALL_ORDERS = generateOrders();
const formatW = (n) => typeof n === "number" ? n.toLocaleString() + "원" : "0원";

// ─── Excel Export ─────────────────────────────────────
async function exportToExcel(data, filename) {
  const XLSX = await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");
  if (Array.isArray(data[0]?.rows)) {
    const wb = XLSX.utils.book_new();
    data.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(sheet.rows);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
    });
    XLSX.writeFile(wb, filename);
  } else {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "데이터");
    XLSX.writeFile(wb, filename);
  }
}

// ─── Theme ────────────────────────────────────────────
const T = {
  pageBg: "#eae6df",
  pageBgGrad: "linear-gradient(145deg, #efebe4 0%, #e5e0d8 50%, #dedad2 100%)",
  cardBg: "linear-gradient(160deg, #fefcf9 0%, #f8f4ec 100%)",
  cardBgFlat: "#faf7f1",
  cardBgWarm: "linear-gradient(145deg, #fef9f0 0%, #f6f0e2 100%)",
  cardBgCool: "linear-gradient(145deg, #f9f7f3 0%, #f0ebe1 100%)",
  cardDark: "linear-gradient(145deg, #4a4541 0%, #3a3632 100%)",
  cardDarkFlat: "#44403c",
  cardGold: "linear-gradient(135deg, #f2d76a 0%, #dbb44a 40%, #c9a020 100%)",
  cardGreen: "linear-gradient(135deg, #6ab07e 0%, #4a9060 100%)",
  cardBlue: "linear-gradient(135deg, #5a8fe0 0%, #3a6fc0 100%)",
  text: "#2c2825",
  textSub: "#8a8278",
  textLight: "#a8a196",
  border: "#e8e3da",
  borderLight: "#f0ece4",
  accent: "#c9a227",
  accentLight: "#f8f1d8",
  accentMuted: "#d4b84a",
  green: "#5a9a6e",
  greenLight: "#eaf5ee",
  blue: "#4a7fd4",
  blueLight: "#eaf0fa",
  orange: "#d49a4a",
  orangeLight: "#fcf2e4",
  radius: 22,
  radiusSm: 14,
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.textLight}; }
  .card-hover { transition: transform 0.3s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.3s cubic-bezier(0.2,0.8,0.2,1); }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.07), 0 2px 8px rgba(201,162,39,0.05); }
  .glass { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(201,162,39,0.15); } 50% { box-shadow: 0 0 16px 4px rgba(201,162,39,0.1); } }
  .animate-in { animation: fadeSlideUp 0.5s cubic-bezier(0.2,0.8,0.2,1) both; }
  button { transition: all 0.2s cubic-bezier(0.2,0.8,0.2,1); }
  button:active { transform: scale(0.97); }
`;
const font = "'Plus Jakarta Sans', 'Noto Sans KR', sans-serif";

// ─── PIN Gate ─────────────────────────────────────────
function PinGate({ onSuccess }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const handleKey = (k) => {
    if (k === "del") { setPin(p => p.slice(0, -1)); setError(false); }
    else if (k === "clear") { setPin(""); setError(false); }
    else if (pin.length < 6) {
      const next = pin + k;
      setPin(next);
      if (next.length === 6) {
        if (next === "000000") setTimeout(() => onSuccess(), 200);
        else { setError(true); setTimeout(() => { setPin(""); setError(false); }, 800); }
      }
    }
  };
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: `linear-gradient(160deg, #efebe4 0%, #e4dfd7 50%, #d9d4cc 100%)`,
      fontFamily: font, position: "relative", overflow: "hidden",
    }}>
      {/* Background decorative circles */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)" }}/>
      <div style={{ position: "absolute", bottom: "15%", right: "8%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(90,154,110,0.04) 0%, transparent 70%)" }}/>
      
      <div style={{
        padding: "52px 44px", borderRadius: 28,
        background: "linear-gradient(160deg, rgba(255,253,249,0.92) 0%, rgba(248,244,236,0.88) 100%)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset, 0 -1px 0 rgba(0,0,0,0.02) inset",
        textAlign: "center", border: `1px solid rgba(255,255,255,0.6)`,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: 48, marginBottom: 8, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.06))" }}>🌿</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 2, letterSpacing: -0.5 }}>로뎀나무</h1>
        <p style={{ fontSize: 13, color: T.textSub, marginBottom: 32 }}>관리자 PIN 6자리 (데모: 000000)</p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 28 }}>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: 13, height: 13, borderRadius: "50%",
              background: pin.length > i
                ? (error ? "#d45050" : T.accent)
                : T.border,
              transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
              transform: pin.length > i ? "scale(1.2)" : "scale(1)",
              boxShadow: pin.length > i && !error ? "0 0 8px rgba(201,162,39,0.3)" : "none",
            }}/>
          ))}
        </div>
        {error && <p style={{ color: "#d45050", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>PIN이 틀렸습니다</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {["1","2","3","4","5","6","7","8","9","clear","0","del"].map(k => (
            <button key={k} onClick={() => handleKey(k)} style={{
              width: 74, height: 54, borderRadius: 12,
              border: `1px solid ${T.borderLight}`,
              background: "linear-gradient(180deg, #fff 0%, #f8f6f2 100%)",
              color: k === "clear" ? "#d45050" : T.text,
              fontSize: k === "clear" || k === "del" ? 12 : 20,
              fontWeight: 600, cursor: "pointer", fontFamily: font,
              transition: "all 0.15s",
            }}>{k === "del" ? "⌫" : k === "clear" ? "초기화" : k}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────
function StatCard({ label, value, sub, dark, gold, icon }) {
  const isDark = dark;
  const bg = gold ? T.cardGold : isDark ? T.cardDark : T.cardBgWarm;
  const color = isDark || gold ? "#fff" : T.text;
  const subColor = isDark || gold ? "rgba(255,255,255,0.55)" : T.textSub;
  return (
    <div className="card-hover" style={{
      padding: "22px 20px", borderRadius: T.radius,
      background: bg, flex: 1, minWidth: 140,
      border: isDark || gold ? "none" : `1px solid ${T.borderLight}`,
      position: "relative", overflow: "hidden",
      boxShadow: gold
        ? "0 6px 24px rgba(201,162,39,0.2), 0 1px 0 rgba(255,255,255,0.25) inset"
        : isDark
          ? "0 6px 24px rgba(60,55,50,0.2), 0 1px 0 rgba(255,255,255,0.05) inset"
          : "0 2px 12px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
    }}>
      {/* Decorative gradient orb */}
      {gold && <div style={{
        position: "absolute", top: -25, right: -25, width: 90, height: 90,
        borderRadius: "50%", background: "rgba(255,255,255,0.18)", filter: "blur(10px)",
      }}/>}
      {gold && <div style={{
        position: "absolute", bottom: -10, left: -10, width: 50, height: 50,
        borderRadius: "50%", background: "rgba(255,255,255,0.1)", filter: "blur(6px)",
      }}/>}
      {isDark && <div style={{
        position: "absolute", top: -15, right: -15, width: 70, height: 70,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)",
      }}/>}
      {isDark && <div style={{
        position: "absolute", bottom: -10, left: 20, width: 50, height: 50,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)",
      }}/>}
      {icon && <div style={{ fontSize: 26, marginBottom: 8, opacity: 0.85, position: "relative", zIndex: 1 }}>{icon}</div>}
      <div style={{ fontSize: 10.5, color: subColor, fontWeight: 700, marginBottom: 5, letterSpacing: 0.6, textTransform: "uppercase", position: "relative", zIndex: 1 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: -0.5, position: "relative", zIndex: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: subColor, marginTop: 3, position: "relative", zIndex: 1 }}>{sub}</div>}
    </div>
  );
}

// ─── Period Dashboard ─────────────────────────────────
function PeriodDashboard({ period, orders }) {
  const grouped = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      let key;
      if (period === "일별") key = o.date;
      else if (period === "주간") key = `${o.date.substring(0, 4)}-W${String(o.week).padStart(2, "0")}`;
      else if (period === "월간") key = o.date.substring(0, 7);
      else if (period === "분기") key = `${o.date.substring(0, 4)}-Q${o.quarter}`;
      else key = o.date.substring(0, 4);
      if (!map[key]) map[key] = { key, cash: 0, transfer: 0, credit: 0, total: 0, count: 0 };
      map[key][o.payment] += o.total;
      map[key].total += o.total;
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.key.localeCompare(a.key));
  }, [orders, period]);

  const chartData = [...grouped].reverse().slice(-20);
  const totalAll = grouped.reduce((s, g) => s + g.total, 0);
  const totalCash = grouped.reduce((s, g) => s + g.cash, 0);
  const totalTransfer = grouped.reduce((s, g) => s + g.transfer, 0);
  const totalCredit = grouped.reduce((s, g) => s + g.credit, 0);
  const avgPerPeriod = grouped.length > 0 ? Math.round(totalAll / grouped.length) : 0;

  const pieData = [
    { name: "현금", value: totalCash, color: PAY_COLOR.cash },
    { name: "계좌이체", value: totalTransfer, color: PAY_COLOR.transfer },
    { name: "외상", value: totalCredit, color: PAY_COLOR.credit },
  ];

  const comp = grouped.length >= 2 ? {
    current: grouped[0], previous: grouped[1],
    diff: grouped[0].total - grouped[1].total,
    pct: grouped[1].total > 0 ? ((grouped[0].total - grouped[1].total) / grouped[1].total * 100).toFixed(1) : 0,
  } : null;

  const handleExport = () => {
    const rows = grouped.map(g => ({ 기간: g.key, 현금: g.cash, 계좌이체: g.transfer, 외상: g.credit, 합계: g.total, 주문수: g.count }));
    exportToExcel(rows, `로뎀나무_${period}_정산.xlsx`);
  };

  const tooltipStyle = { contentStyle: { borderRadius: 14, border: `1px solid ${T.borderLight}`, fontSize: 13, background: "rgba(254,252,248,0.95)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", backdropFilter: "blur(8px)" } };

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <StatCard label="총 매출" value={formatW(totalAll)} gold icon="💰" />
        <StatCard label="현금" value={formatW(totalCash)} icon="💵" />
        <StatCard label="계좌이체" value={formatW(totalTransfer)} icon="🏦" />
        <StatCard label="외상" value={formatW(totalCredit)} icon="📋" />
        <StatCard label={`평균/${period.replace("별","")}`} value={formatW(avgPerPeriod)} dark />
      </div>

      {/* Comparison */}
      {comp && (
        <div className="card-hover" style={{
          padding: 22, borderRadius: T.radius,
          background: T.cardBgCool,
          border: `1px solid ${T.borderLight}`, marginBottom: 16,
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 13, color: T.textSub, fontWeight: 700, marginBottom: 10 }}>📊 직전 기간 비교</div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>{comp.current.key}</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{formatW(comp.current.total)}</div>
              </div>
              <div style={{ fontSize: 20, color: T.textLight }}>vs</div>
              <div>
                <div style={{ fontSize: 11, color: T.textSub }}>{comp.previous.key}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: T.textSub }}>{formatW(comp.previous.total)}</div>
              </div>
            </div>
          </div>
          <div style={{
            padding: "14px 24px", borderRadius: T.radiusSm,
            background: comp.diff >= 0
              ? "linear-gradient(135deg, #eaf5ee 0%, #d8eddf 100%)"
              : "linear-gradient(135deg, #fce8e8 0%, #f5d5d5 100%)",
            textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: comp.diff >= 0 ? T.green : "#d45050" }}>
              {comp.diff >= 0 ? "▲" : "▼"} {Math.abs(comp.pct)}%
            </div>
            <div style={{ fontSize: 12, color: T.textSub }}>{comp.diff >= 0 ? "+" : ""}{formatW(comp.diff)}</div>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div className="card-hover" style={{
          flex: 2, minWidth: 340, padding: 22, borderRadius: T.radius,
          background: T.cardBg, border: `1px solid ${T.borderLight}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>결제 방식별 매출 추이</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
              <XAxis dataKey="key" tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => v.length > 7 ? v.slice(5) : v} />
              <YAxis tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => (v/10000) + "만"} />
              <Tooltip formatter={(v, name) => [formatW(v), PAY_LABEL[name] || name]} {...tooltipStyle} />
              <Legend formatter={v => PAY_LABEL[v] || v} />
              <Bar dataKey="cash" stackId="a" fill={PAY_COLOR.cash} radius={[0,0,0,0]} />
              <Bar dataKey="transfer" stackId="a" fill={PAY_COLOR.transfer} />
              <Bar dataKey="credit" stackId="a" fill={PAY_COLOR.credit} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie — dark card */}
        <div className="card-hover" style={{
          flex: 1, minWidth: 220, padding: 22, borderRadius: T.radius,
          background: T.cardDark, display: "flex", flexDirection: "column", alignItems: "center",
          position: "relative", overflow: "hidden",
          boxShadow: "0 6px 24px rgba(60,55,50,0.18), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}>
          {/* Subtle warm accent glow */}
          <div style={{
            position: "absolute", top: -25, right: -25, width: 110, height: 110,
            borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)",
          }}/>
          <div style={{
            position: "absolute", bottom: -20, left: -20, width: 80, height: 80,
            borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
          }}/>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 14, alignSelf: "flex-start", position: "relative", zIndex: 1 }}>결제 비율</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatW(v)} contentStyle={{ borderRadius: 12, fontSize: 13, background: "rgba(68,64,60,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
            {pieData.map(p => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                <span style={{ fontWeight: 600, color: "#fff" }}>{p.name}</span>
                <span>{totalAll > 0 ? (p.value / totalAll * 100).toFixed(0) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="card-hover" style={{
        padding: 22, borderRadius: T.radius, background: T.cardBgWarm,
        border: `1px solid ${T.borderLight}`, marginBottom: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>매출 추이 (총액)</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis dataKey="key" tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => v.length > 7 ? v.slice(5) : v} />
            <YAxis tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => (v/10000) + "만"} />
            <Tooltip formatter={(v) => formatW(v)} {...tooltipStyle} />
            <Line type="monotone" dataKey="total" stroke={T.accent} strokeWidth={2.5} dot={{ r: 3, fill: T.accent }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card-hover" style={{
        padding: 22, borderRadius: T.radius, background: T.cardBg,
        border: `1px solid ${T.borderLight}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{period} 정산 내역</div>
          <button onClick={handleExport} style={{
            padding: "10px 20px", borderRadius: T.radiusSm, border: "none",
            background: T.cardGreen, color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 3px 10px rgba(90,154,110,0.25)",
          }}>📥 엑셀 다운로드</button>
        </div>
        <div style={{ overflowX: "auto", maxHeight: 400, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 14 }}>
            <thead>
              <tr>
                {["기간","현금","계좌이체","외상","합계","주문수"].map(h => (
                  <th key={h} style={{
                    padding: "12px 14px", textAlign: h === "기간" ? "left" : "right",
                    fontWeight: 700, color: T.textSub, fontSize: 11, letterSpacing: 0.5,
                    textTransform: "uppercase", borderBottom: `2px solid ${T.border}`,
                    position: "sticky", top: 0, background: T.cardBgFlat, zIndex: 1,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grouped.slice(0, 50).map(g => (
                <tr key={g.key} style={{
                  borderRadius: 10, transition: "background 0.15s", cursor: "default",
                }} onMouseEnter={e => e.currentTarget.style.background = "rgba(201,162,39,0.06)"}
                   onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, borderRadius: "10px 0 0 10px" }}>{g.key}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.green, fontWeight: 600 }}>{formatW(g.cash)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.blue, fontWeight: 600 }}>{formatW(g.transfer)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.orange, fontWeight: 600 }}>{formatW(g.credit)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800 }}>{formatW(g.total)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.textSub, borderRadius: "0 10px 10px 0" }}>{g.count}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Customer Dashboard ───────────────────────────────
function CustomerDashboard({ orders }) {
  const [sortBy, setSortBy] = useState("total");
  const [selectedMember, setSelectedMember] = useState(null);

  const memberStats = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (!map[o.member]) map[o.member] = { name: o.member, total: 0, count: 0, credit: 0, cash: 0, transfer: 0, items: {} };
      map[o.member].total += o.total;
      map[o.member].count += 1;
      map[o.member][o.payment] += o.total;
      map[o.member].items[o.menu] = (map[o.member].items[o.menu] || 0) + o.qty;
    });
    return Object.values(map).sort((a, b) => b[sortBy] - a[sortBy]);
  }, [orders, sortBy]);

  const memberMonthly = useMemo(() => {
    if (!selectedMember) return [];
    const map = {};
    orders.filter(o => o.member === selectedMember).forEach(o => {
      const m = o.date.substring(0, 7);
      if (!map[m]) map[m] = { month: m, total: 0, credit: 0 };
      map[m].total += o.total;
      if (o.payment === "credit") map[m].credit += o.total;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [orders, selectedMember]);

  const topMember = memberStats[0];
  const totalCredit = memberStats.reduce((s, m) => s + m.credit, 0);

  const handleExportAll = () => {
    const rows = memberStats.map(m => ({
      이름: m.name, 총_이용금액: m.total, 주문수: m.count, 현금: m.cash,
      계좌이체: m.transfer, 외상_잔액: m.credit,
      자주_주문: Object.entries(m.items).sort((a,b) => b[1] - a[1]).slice(0, 3).map(([k,v]) => `${k}(${v}잔)`).join(", "),
    }));
    exportToExcel(rows, `로뎀나무_고객별_정산.xlsx`);
  };

  const handleExportMember = () => {
    if (!selectedMember) return;
    const rows = orders.filter(o => o.member === selectedMember).map(o => ({
      날짜: o.date, 메뉴: o.menu, 수량: o.qty, 금액: o.total, 결제방식: PAY_LABEL[o.payment],
    }));
    exportToExcel(rows, `로뎀나무_${selectedMember}_주문내역.xlsx`);
  };

  const tooltipStyle = { contentStyle: { borderRadius: 14, border: `1px solid ${T.borderLight}`, fontSize: 13, background: "rgba(254,252,248,0.95)", backdropFilter: "blur(8px)" } };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <StatCard label="총 고객 수" value={`${memberStats.length}명`} icon="👥" />
        <StatCard label="총 외상 잔액" value={formatW(totalCredit)} icon="📋" />
        {topMember && <StatCard label="최다 이용 고객" value={topMember.name} sub={`${formatW(topMember.total)} · ${topMember.count}건`} gold />}
      </div>

      {/* Top 10 */}
      <div className="card-hover" style={{
        padding: 22, borderRadius: T.radius, background: T.cardBgCool,
        border: `1px solid ${T.borderLight}`, marginBottom: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>고객별 이용 금액 TOP 10</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={memberStats.slice(0, 10)} layout="vertical" barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
            <XAxis type="number" tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => (v/10000) + "만"} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 13, fill: T.text, fontWeight: 600 }} width={70} />
            <Tooltip formatter={(v, name) => [formatW(v), PAY_LABEL[name] || name]} {...tooltipStyle} />
            <Bar dataKey="cash" stackId="a" fill={PAY_COLOR.cash} />
            <Bar dataKey="transfer" stackId="a" fill={PAY_COLOR.transfer} />
            <Bar dataKey="credit" stackId="a" fill={PAY_COLOR.credit} radius={[0,4,4,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Member detail modal */}
      {selectedMember && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(58,54,50,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20,
          backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        }} onClick={() => setSelectedMember(null)}>
          <div style={{
            background: "linear-gradient(160deg, #fefcf8 0%, #f5f1e8 100%)",
            borderRadius: 24, width: "100%", maxWidth: 560,
            maxHeight: "85vh", overflow: "auto", padding: 28,
            border: `1px solid rgba(255,255,255,0.5)`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.7) inset",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800 }}>{selectedMember} 님</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleExportMember} style={{
                  padding: "8px 16px", borderRadius: 10, border: "none",
                  background: T.cardGreen, color: "#fff", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: font,
                  boxShadow: "0 2px 8px rgba(90,154,110,0.2)",
                }}>📥 엑셀</button>
                <button onClick={() => setSelectedMember(null)} style={{
                  background: "linear-gradient(135deg, #f0ece4 0%, #e8e3da 100%)", border: "none",
                  width: 34, height: 34, borderRadius: 10, fontSize: 18,
                  cursor: "pointer", color: T.textSub,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              </div>
            </div>

            {(() => {
              const m = memberStats.find(x => x.name === selectedMember);
              if (!m) return null;
              const fav = Object.entries(m.items).sort((a,b) => b[1] - a[1]);
              return <>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                  <StatCard label="총 이용" value={formatW(m.total)} sub={`${m.count}건`} />
                  <StatCard label="외상" value={formatW(m.credit)} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>자주 주문한 메뉴</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                  {fav.slice(0, 5).map(([name, qty]) => (
                    <span key={name} style={{
                      padding: "6px 14px", borderRadius: 20, background: T.accentLight,
                      fontSize: 13, fontWeight: 600, color: T.text,
                    }}>{name} · {qty}잔</span>
                  ))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>월별 이용 추이</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={memberMonthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => v.slice(5) + "월"} />
                    <YAxis tick={{ fontSize: 11, fill: T.textSub }} tickFormatter={v => (v/10000) + "만"} />
                    <Tooltip formatter={(v) => formatW(v)} {...tooltipStyle} />
                    <Bar dataKey="total" fill={T.accent} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>;
            })()}
          </div>
        </div>
      )}

      {/* Customer table */}
      <div className="card-hover" style={{
        padding: 22, borderRadius: T.radius, background: T.cardBg,
        border: `1px solid ${T.borderLight}`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>고객별 정산</span>
            <div style={{ display: "flex", gap: 4 }}>
              {[{ key: "total", label: "총액순" }, { key: "count", label: "주문수순" }, { key: "credit", label: "외상순" }].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)} style={{
                  padding: "7px 14px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                  border: sortBy === s.key ? "none" : `1px solid ${T.borderLight}`,
                  background: sortBy === s.key
                    ? "linear-gradient(135deg, #d4b030 0%, #c49520 100%)"
                    : "linear-gradient(135deg, #fff 0%, #f8f6f2 100%)",
                  color: sortBy === s.key ? "#fff" : T.text,
                  cursor: "pointer", fontFamily: font,
                  boxShadow: sortBy === s.key ? "0 2px 8px rgba(201,162,39,0.25)" : "none",
                }}>{s.label}</button>
              ))}
            </div>
          </div>
          <button onClick={handleExportAll} style={{
            padding: "10px 20px", borderRadius: T.radiusSm, border: "none",
            background: T.cardGreen, color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: font,
            boxShadow: "0 3px 10px rgba(90,154,110,0.25)",
          }}>📥 전체 엑셀</button>
        </div>
        <div style={{ overflowX: "auto", maxHeight: 500, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px", fontSize: 14 }}>
            <thead>
              <tr>
                {["#","이름","총 이용","주문수","현금","이체","외상",""].map(h => (
                  <th key={h} style={{
                    padding: "12px 14px", textAlign: ["#","이름",""].includes(h) ? "left" : "right",
                    fontWeight: 700, color: T.textSub, fontSize: 11, letterSpacing: 0.5,
                    borderBottom: `2px solid ${T.border}`,
                    position: "sticky", top: 0, background: T.cardBgFlat, zIndex: 1,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberStats.map((m, i) => (
                <tr key={m.name}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(201,162,39,0.06)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: T.accent }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 700 }}>{m.name}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 800 }}>{formatW(m.total)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.textSub }}>{m.count}건</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.green, fontWeight: 600 }}>{formatW(m.cash)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: T.blue, fontWeight: 600 }}>{formatW(m.transfer)}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: m.credit > 0 ? T.orange : T.textSub, fontWeight: m.credit > 0 ? 700 : 400 }}>{formatW(m.credit)}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <button onClick={() => setSelectedMember(m.name)} style={{
                      padding: "6px 14px", borderRadius: 10,
                      border: "none",
                      background: "linear-gradient(135deg, #f0ece4 0%, #e8e3da 100%)",
                      fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font,
                      color: T.text, letterSpacing: 0.2,
                    }}>보기</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Full Export ───────────────────────────────────────
function FullExportPanel({ orders }) {
  const handleFullExport = () => {
    const sheets = [
      { name: "전체주문내역", rows: orders.map(o => ({ 날짜: o.date, 고객: o.member, 메뉴: o.menu, 카테고리: o.category, 수량: o.qty, 단가: o.unitPrice, 금액: o.total, 결제방식: PAY_LABEL[o.payment] })) },
      { name: "월별정산", rows: (() => { const map = {}; orders.forEach(o => { const m = o.date.substring(0, 7); if (!map[m]) map[m] = { 월: m, 현금: 0, 계좌이체: 0, 외상: 0, 합계: 0, 주문수: 0 }; map[m][PAY_LABEL[o.payment]] += o.total; map[m].합계 += o.total; map[m].주문수 += 1; }); return Object.values(map).sort((a, b) => a.월.localeCompare(b.월)); })() },
      { name: "고객별정산", rows: (() => { const map = {}; orders.forEach(o => { if (!map[o.member]) map[o.member] = { 이름: o.member, 총액: 0, 주문수: 0, 현금: 0, 계좌이체: 0, 외상: 0 }; map[o.member].총액 += o.total; map[o.member].주문수 += 1; map[o.member][PAY_LABEL[o.payment]] += o.total; }); return Object.values(map).sort((a, b) => b.총액 - a.총액); })() },
      { name: "메뉴별통계", rows: (() => { const map = {}; orders.forEach(o => { if (!map[o.menu]) map[o.menu] = { 메뉴: o.menu, 카테고리: o.category, 총판매수량: 0, 총매출: 0 }; map[o.menu].총판매수량 += o.qty; map[o.menu].총매출 += o.total; }); return Object.values(map).sort((a, b) => b.총매출 - a.총매출); })() },
    ];
    exportToExcel(sheets, `로뎀나무_종합보고서_${new Date().toISOString().split("T")[0]}.xlsx`);
  };
  return (
    <div className="card-hover" style={{
      padding: "56px 32px", borderRadius: T.radius,
      background: T.cardBgWarm,
      border: `1px solid ${T.borderLight}`, textAlign: "center",
      position: "relative", overflow: "hidden",
      boxShadow: "0 2px 10px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
    }}>
      {/* Decorative gradient orbs */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 160, height: 160,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)",
      }}/>
      <div style={{
        position: "absolute", bottom: -30, left: -30, width: 120, height: 120,
        borderRadius: "50%", background: "radial-gradient(circle, rgba(90,154,110,0.06) 0%, transparent 70%)",
      }}/>
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
        <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>종합 보고서 엑셀</h3>
        <p style={{ fontSize: 14, color: T.textSub, marginBottom: 28, lineHeight: 1.8 }}>
          4개 시트 포함: 전체 주문 · 월별 정산 · 고객별 정산 · 메뉴별 통계
        </p>
        <button onClick={handleFullExport} style={{
          padding: "18px 48px", borderRadius: T.radiusSm, border: "none",
          background: T.cardGreen, color: "#fff", fontSize: 18, fontWeight: 800,
          cursor: "pointer", fontFamily: font,
          boxShadow: "0 4px 16px rgba(90,154,110,0.3), 0 1px 0 rgba(255,255,255,0.2) inset",
        }}>📥 종합 보고서 다운로드</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────
export default function RodemDashboard() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState("일별");
  const TABS = ["일별", "주간", "월간", "분기", "연간", "고객별", "종합 Export"];

  if (!authed) return (
    <><style>{globalCSS}</style><PinGate onSuccess={() => setAuthed(true)} /></>
  );

  return (
    <div style={{ fontFamily: font, background: T.pageBgGrad, minHeight: "100vh" }}>
      <style>{globalCSS}</style>

      {/* Header */}
      <div className="glass" style={{
        background: "linear-gradient(180deg, rgba(255,253,250,0.96) 0%, rgba(248,244,237,0.92) 100%)",
        padding: "16px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid rgba(232,227,218,0.6)`,
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 20px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 13,
            background: "linear-gradient(135deg, #f8f1d8 0%, #e8d4a0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 21, boxShadow: "0 3px 12px rgba(201,162,39,0.15), 0 1px 0 rgba(255,255,255,0.5) inset",
          }}>🌿</div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: -0.5 }}>로뎀나무 대시보드</h1>
            <p style={{ fontSize: 11, color: T.textLight, fontWeight: 500 }}>청주남부교회 카페 정산</p>
          </div>
        </div>
        <button onClick={() => setAuthed(false)} style={{
          padding: "8px 16px", borderRadius: 10,
          border: "none",
          background: "linear-gradient(145deg, #4a4541 0%, #3a3632 100%)",
          fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font,
          color: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", gap: 5,
          boxShadow: "0 2px 8px rgba(60,55,50,0.15)",
          letterSpacing: 0.3,
        }}>🔒 잠금</button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 60px" }}>
        {/* Tab bar */}
        <div className="glass" style={{
          display: "flex", gap: 5, marginBottom: 24, overflowX: "auto",
          background: "linear-gradient(160deg, rgba(255,253,250,0.88) 0%, rgba(248,244,237,0.82) 100%)",
          borderRadius: 16, padding: 6,
          border: `1px solid rgba(255,255,255,0.5)`,
          boxShadow: "0 2px 12px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.7) inset",
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "11px 24px", borderRadius: 11, border: "none",
              background: activeTab === t
                ? "linear-gradient(135deg, #d4b030 0%, #c49520 100%)"
                : "transparent",
              color: activeTab === t ? "#fff" : T.textSub,
              fontSize: 13.5, fontWeight: activeTab === t ? 700 : 500,
              cursor: "pointer", fontFamily: font,
              whiteSpace: "nowrap", letterSpacing: activeTab === t ? 0.2 : 0,
              boxShadow: activeTab === t ? "0 3px 12px rgba(201,162,39,0.22)" : "none",
            }}>{t}</button>
          ))}
        </div>

        {/* Content */}
        {["일별","주간","월간","분기","연간"].includes(activeTab) && <PeriodDashboard period={activeTab} orders={ALL_ORDERS} />}
        {activeTab === "고객별" && <CustomerDashboard orders={ALL_ORDERS} />}
        {activeTab === "종합 Export" && <FullExportPanel orders={ALL_ORDERS} />}
      </div>
    </div>
  );
}
