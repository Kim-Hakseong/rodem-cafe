import { useState } from "react";

// ─── Theme ────────────────────────────────────────────
const T={pageBg:"#eae6df",pageBgGrad:"linear-gradient(145deg,#efebe4 0%,#e5e0d8 50%,#dedad2 100%)",cardBg:"linear-gradient(160deg,#fefcf9 0%,#f8f4ec 100%)",cardBgFlat:"#faf7f1",cardBgWarm:"linear-gradient(145deg,#fef9f0 0%,#f6f0e2 100%)",cardDark:"linear-gradient(145deg,#4a4541 0%,#3a3632 100%)",cardGold:"linear-gradient(135deg,#f2d76a 0%,#dbb44a 40%,#c9a020 100%)",cardGreen:"linear-gradient(135deg,#6ab07e 0%,#4a9060 100%)",text:"#2c2825",textSub:"#8a8278",textLight:"#a8a196",border:"#e8e3da",borderLight:"#f0ece4",accent:"#c9a227",accentLight:"#f8f1d8",green:"#5a9a6e",greenLight:"#eaf5ee",blue:"#4a7fd4",blueLight:"#eaf0fa",orange:"#d49a4a",orangeLight:"#fcf2e4",red:"#c45050",redLight:"#fce8e8",r:22,rs:14};
const F="'Plus Jakarta Sans','Noto Sans KR',sans-serif";
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:10px}.hov{transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s cubic-bezier(.2,.8,.2,1)}.hov:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.06)}.glass{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}button{transition:all .2s cubic-bezier(.2,.8,.2,1);font-family:${F}}button:active{transform:scale(.97)}`;
const formatPrice=(n)=>n.toLocaleString()+"원";
const now=()=>{const d=new Date();return`${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`};

// ─── Data ─────────────────────────────────────────────
const MEMBERS=[{id:1,name:"김영희",group:"ㄱ"},{id:2,name:"김철수",group:"ㄱ"},{id:3,name:"김은혜",group:"ㄱ"},{id:4,name:"김성민",group:"ㄱ"},{id:5,name:"김하늘",group:"ㄱ"},{id:6,name:"나은영",group:"ㄴ"},{id:7,name:"노병석",group:"ㄴ"},{id:8,name:"류미정",group:"ㄹ"},{id:9,name:"박수진",group:"ㅂ"},{id:10,name:"박정훈",group:"ㅂ"},{id:11,name:"박민서",group:"ㅂ"},{id:12,name:"서영주",group:"ㅅ"},{id:13,name:"손지현",group:"ㅅ"},{id:14,name:"송태호",group:"ㅅ"},{id:15,name:"신혜원",group:"ㅅ"},{id:16,name:"안수빈",group:"ㅇ"},{id:17,name:"유재석",group:"ㅇ"},{id:18,name:"이동국",group:"ㅇ"},{id:19,name:"이서연",group:"ㅇ"},{id:20,name:"이현우",group:"ㅇ"},{id:21,name:"장미란",group:"ㅈ"},{id:22,name:"전상우",group:"ㅈ"},{id:23,name:"정다은",group:"ㅈ"},{id:24,name:"조현석",group:"ㅈ"},{id:25,name:"최윤아",group:"ㅊ"},{id:26,name:"최준혁",group:"ㅊ"},{id:27,name:"한소율",group:"ㅎ"},{id:28,name:"홍길동",group:"ㅎ"}];
const MENUS=[{id:1,name:"아메리카노(HOT)",price:2000,category:"커피",emoji:"☕"},{id:2,name:"아메리카노(ICE)",price:2500,category:"커피",emoji:"🧊"},{id:3,name:"카페라떼(HOT)",price:3000,category:"커피",emoji:"☕"},{id:4,name:"카페라떼(ICE)",price:3500,category:"커피",emoji:"🧊"},{id:5,name:"바닐라라떼(HOT)",price:3500,category:"커피",emoji:"☕"},{id:6,name:"바닐라라떼(ICE)",price:4000,category:"커피",emoji:"🧊"},{id:7,name:"카푸치노",price:3000,category:"커피",emoji:"☕"},{id:8,name:"카라멜마끼아또",price:3500,category:"커피",emoji:"🍯"},{id:9,name:"녹차라떼(HOT)",price:3500,category:"논커피",emoji:"🍵"},{id:10,name:"녹차라떼(ICE)",price:4000,category:"논커피",emoji:"🍵"},{id:11,name:"유자차",price:3000,category:"논커피",emoji:"🍋"},{id:12,name:"레몬에이드",price:3500,category:"논커피",emoji:"🍋"},{id:13,name:"핫초코",price:3000,category:"논커피",emoji:"🍫"},{id:14,name:"딸기스무디",price:4000,category:"논커피",emoji:"🍓"},{id:15,name:"쿠키",price:1500,category:"디저트",emoji:"🍪"},{id:16,name:"머핀",price:2500,category:"디저트",emoji:"🧁"}];
const CHOSUNG=["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const PAYS=[{id:"cash",label:"현금",icon:"💵",color:T.green,bg:T.greenLight},{id:"transfer",label:"계좌이체",icon:"🏦",color:T.blue,bg:T.blueLight},{id:"credit",label:"외상",icon:"📋",color:T.orange,bg:T.orangeLight}];

// ─── Mode Selector ────────────────────────────────────
function ModeSelector({onSelect}){
  return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:T.pageBgGrad,position:"relative",overflow:"hidden",fontFamily:F}}>
    <div style={{position:"absolute",top:"8%",left:"10%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,162,39,.06) 0%,transparent 70%)"}}/>
    <div style={{position:"absolute",bottom:"12%",right:"5%",width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(90,154,110,.04) 0%,transparent 70%)"}}/>
    <div style={{textAlign:"center",marginBottom:48,position:"relative",zIndex:1}}>
      <div style={{fontSize:56,marginBottom:12,filter:"drop-shadow(0 2px 8px rgba(0,0,0,.06))"}}>🌿</div>
      <h1 style={{fontSize:32,fontWeight:800,color:T.accent,letterSpacing:-1,marginBottom:8}}>로뎀나무</h1>
      <p style={{fontSize:16,color:T.textSub,fontWeight:500}}>청주남부교회 카페</p>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:14,width:"100%",maxWidth:360,position:"relative",zIndex:1}}>
      <button onClick={()=>onSelect("pos")} style={{padding:"28px 24px",borderRadius:T.r,border:"none",background:T.cardGold,color:"#fff",cursor:"pointer",fontSize:20,fontWeight:700,display:"flex",alignItems:"center",gap:16,boxShadow:"0 6px 24px rgba(201,162,39,.2),0 1px 0 rgba(255,255,255,.25) inset"}}>
        <span style={{fontSize:32}}>📋</span>
        <div style={{textAlign:"left"}}><div>봉사자 주문</div><div style={{fontSize:13,fontWeight:400,opacity:.85,marginTop:2}}>주문 접수 · 결제 기록 · 외상 관리</div></div>
      </button>
      <button onClick={()=>onSelect("lookup")} style={{padding:"28px 24px",borderRadius:T.r,border:`1px solid ${T.borderLight}`,background:T.cardBg,color:T.text,cursor:"pointer",fontSize:20,fontWeight:700,display:"flex",alignItems:"center",gap:16,boxShadow:"0 2px 12px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
        <span style={{fontSize:32}}>👀</span>
        <div style={{textAlign:"left"}}><div>내 외상 조회</div><div style={{fontSize:13,fontWeight:400,color:T.textSub,marginTop:2}}>외상 잔액 · 주문 내역 확인</div></div>
      </button>
    </div>
    <p style={{marginTop:48,fontSize:12,color:T.textLight,textAlign:"center",lineHeight:1.6,position:"relative",zIndex:1}}>ⓘ 프로토타입 데모 — 샘플 데이터로 동작합니다</p>
  </div>);
}

// ─── PIN Entry ────────────────────────────────────────
function PinEntry({onSuccess,onBack}){
  const[pin,setPin]=useState("");const[error,setError]=useState(false);
  const handleKey=(k)=>{if(k==="del"){setPin(p=>p.slice(0,-1));setError(false)}else if(k==="clear"){setPin("");setError(false)}else if(pin.length<6){const next=pin+k;setPin(next);if(next.length===6){if(next==="000000")setTimeout(()=>onSuccess(),200);else{setError(true);setTimeout(()=>{setPin("");setError(false)},800)}}}};
  return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:T.pageBgGrad,fontFamily:F,position:"relative"}}>
    <button onClick={onBack} style={{position:"absolute",top:16,left:16,background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",fontSize:14,color:T.textSub,cursor:"pointer",padding:"8px 14px",borderRadius:10}}>← 뒤로</button>
    <div style={{fontSize:40,marginBottom:16}}>🔒</div>
    <h2 style={{fontSize:22,fontWeight:700,marginBottom:8,color:T.text}}>봉사자 인증</h2>
    <p style={{fontSize:14,color:T.textSub,marginBottom:32}}>PIN 6자리를 입력하세요 (데모: 000000)</p>
    <div style={{display:"flex",gap:14,marginBottom:28}}>
      {[0,1,2,3,4,5].map(i=>(<div key={i} style={{width:13,height:13,borderRadius:"50%",background:pin.length>i?(error?T.red:T.accent):T.border,transition:"all .25s cubic-bezier(.2,.8,.2,1)",transform:pin.length>i?"scale(1.2)":"scale(1)",boxShadow:pin.length>i&&!error?"0 0 8px rgba(201,162,39,.3)":"none"}}/>))}
    </div>
    {error&&<p style={{color:T.red,fontSize:14,fontWeight:600,marginBottom:16}}>PIN이 틀렸습니다</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,maxWidth:270}}>
      {["1","2","3","4","5","6","7","8","9","clear","0","del"].map(k=>(<button key={k} onClick={()=>handleKey(k)} style={{width:80,height:56,borderRadius:12,border:`1px solid ${T.borderLight}`,background:"linear-gradient(180deg,#fff 0%,#f8f6f2 100%)",fontSize:k==="clear"||k==="del"?13:22,fontWeight:600,cursor:"pointer",color:k==="clear"?T.red:T.text}}>{k==="del"?"⌫":k==="clear"?"초기화":k}</button>))}
    </div>
  </div>);
}

// ─── Header ───────────────────────────────────────────
function Header({title,onBack,right}){
  return(<div className="glass" style={{display:"flex",alignItems:"center",padding:"14px 16px",background:T.cardDark,color:"#fff",gap:12,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 16px rgba(60,55,50,.12)"}}>
    {onBack&&<button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",color:"#fff",width:36,height:36,borderRadius:10,fontSize:18,cursor:"pointer"}}>←</button>}
    <h2 style={{fontSize:17,fontWeight:700,flex:1,letterSpacing:-.3}}>{title}</h2>
    {right}
  </div>);
}

// ─── Step Indicator ───────────────────────────────────
function Steps({steps,current}){
  return(<div style={{display:"flex",gap:4,padding:"12px 16px",background:T.cardBgFlat,borderBottom:`1px solid ${T.borderLight}`}}>
    {steps.map((s,i)=>(<div key={s} style={{flex:1,textAlign:"center",padding:"6px 0",fontSize:12,fontWeight:i<=current?700:500,color:i<=current?T.accent:T.textLight,borderBottom:`3px solid ${i<=current?T.accent:T.borderLight}`,transition:"all .2s"}}>{s}</div>))}
  </div>);
}

// ─── POS Screen ───────────────────────────────────────
function POSScreen({onBack,orders,setOrders,creditPayments,setCreditPayments}){
  const[step,setStep]=useState("select-member");
  const[selectedMember,setSelectedMember]=useState(null);
  const[cart,setCart]=useState([]);
  const[paymentMethod,setPaymentMethod]=useState(null);
  const[searchQuery,setSearchQuery]=useState("");
  const[activeChosung,setActiveChosung]=useState(null);
  const[menuCategory,setMenuCategory]=useState("전체");
  const[showSummary,setShowSummary]=useState(false);
  const[showCreditMgmt,setShowCreditMgmt]=useState(false);

  const resetOrder=()=>{setStep("select-member");setSelectedMember(null);setCart([]);setPaymentMethod(null);setSearchQuery("");setActiveChosung(null)};
  const getMemberBalance=(mid)=>{const cr=orders.filter(o=>o.memberId===mid&&o.paymentMethod==="credit").reduce((s,o)=>s+o.total,0);const pd=creditPayments.filter(cp=>cp.memberId===mid).reduce((s,cp)=>s+cp.amount,0);return cr-pd};
  const filtered=MEMBERS.filter(m=>{if(searchQuery)return m.name.includes(searchQuery);if(activeChosung)return m.group===activeChosung;return true});
  const filteredMenu=menuCategory==="전체"?MENUS:MENUS.filter(m=>m.category===menuCategory);
  const cartTotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const addToCart=(item)=>setCart(p=>{const i=p.findIndex(c=>c.id===item.id);if(i>=0){const n=[...p];n[i]={...n[i],qty:n[i].qty+1};return n}return[...p,{...item,qty:1}]});
  const removeFromCart=(id)=>setCart(p=>{const i=p.findIndex(c=>c.id===id);if(i<0)return p;if(p[i].qty===1)return p.filter(c=>c.id!==id);const n=[...p];n[i]={...n[i],qty:n[i].qty-1};return n});
  const completeOrder=()=>{setOrders(p=>[{id:Date.now(),memberId:selectedMember.id,memberName:selectedMember.name,items:cart.map(c=>({name:c.name,qty:c.qty,price:c.price})),total:cartTotal,paymentMethod,time:now()},...p]);setStep("done")};

  const headerRight=(<div style={{display:"flex",gap:6}}>
    <button onClick={()=>setShowSummary(true)} style={{background:"rgba(255,255,255,.1)",border:"none",color:"#fff",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>📊 정산</button>
    <button onClick={()=>setShowCreditMgmt(true)} style={{background:"rgba(255,255,255,.1)",border:"none",color:"#fff",padding:"6px 12px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>💰 외상</button>
  </div>);

  const stepNames=["성도 선택","메뉴 선택","결제 방식","확인"];
  const stepIdx=["select-member","select-menu","select-payment","confirm"].indexOf(step);

  // ── Member Selection ──
  if(step==="select-member")return(
    <div style={{minHeight:"100vh",background:T.pageBgGrad,fontFamily:F}}>
      <Header title="🌿 로뎀나무 — 주문 접수" onBack={onBack} right={headerRight}/>
      <Steps steps={stepNames} current={stepIdx}/>
      <div style={{padding:"12px 16px 0"}}><input type="text" placeholder="성도 이름 검색..." value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);setActiveChosung(null)}} style={{width:"100%",padding:"14px 16px",borderRadius:T.rs,border:`2px solid ${T.borderLight}`,fontSize:16,fontFamily:F,background:T.cardBgFlat}}/></div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px 16px"}}>
        <button onClick={()=>setActiveChosung(null)} style={{padding:"8px 14px",borderRadius:10,border:"none",background:!activeChosung?T.accent:T.cardBgFlat,color:!activeChosung?"#fff":T.text,fontSize:14,fontWeight:600,cursor:"pointer"}}>전체</button>
        {CHOSUNG.filter(c=>MEMBERS.some(m=>m.group===c)).map(c=>(<button key={c} onClick={()=>{setActiveChosung(c);setSearchQuery("")}} style={{padding:"8px 14px",borderRadius:10,border:"none",background:activeChosung===c?T.accent:T.cardBgFlat,color:activeChosung===c?"#fff":T.text,fontSize:14,fontWeight:600,cursor:"pointer"}}>{c}</button>))}
      </div>
      <div style={{padding:"0 16px 100px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {filtered.map(m=>{const bal=getMemberBalance(m.id);return(
          <button key={m.id} onClick={()=>{setSelectedMember(m);setStep("select-menu")}} className="hov" style={{padding:"16px 12px",borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBg,cursor:"pointer",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
            <div style={{fontSize:17,fontWeight:700,color:T.text}}>{m.name}</div>
            {bal>0&&<div style={{fontSize:11,color:T.orange,fontWeight:600,marginTop:4}}>외상 {formatPrice(bal)}</div>}
          </button>)})}
      </div>
      {showSummary&&<SummaryModal orders={orders} onClose={()=>setShowSummary(false)}/>}
      {showCreditMgmt&&<CreditMgmtModal orders={orders} creditPayments={creditPayments} setCreditPayments={setCreditPayments} getMemberBalance={getMemberBalance} onClose={()=>setShowCreditMgmt(false)}/>}
    </div>);

  // ── Menu Selection ──
  if(step==="select-menu")return(
    <div style={{minHeight:"100vh",background:T.pageBgGrad,fontFamily:F}}>
      <Header title={`${selectedMember.name} 님 주문`} onBack={resetOrder}/>
      <Steps steps={stepNames} current={stepIdx}/>
      <div style={{display:"flex",gap:8,padding:"12px 16px",overflowX:"auto"}}>
        {["전체","커피","논커피","디저트"].map(cat=>(<button key={cat} onClick={()=>setMenuCategory(cat)} style={{padding:"8px 18px",borderRadius:20,border:"none",background:menuCategory===cat?"linear-gradient(135deg,#d4b030,#c49520)":T.cardBgFlat,color:menuCategory===cat?"#fff":T.text,fontSize:14,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",boxShadow:menuCategory===cat?"0 2px 8px rgba(201,162,39,.2)":"none"}}>{cat}</button>))}
      </div>
      <div style={{padding:"0 16px",display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {filteredMenu.map(item=>{const inCart=cart.find(c=>c.id===item.id);return(
          <button key={item.id} onClick={()=>addToCart(item)} className="hov" style={{padding:14,borderRadius:T.rs,border:inCart?`2px solid ${T.accent}`:`1px solid ${T.borderLight}`,background:inCart?T.accentLight:T.cardBg,cursor:"pointer",textAlign:"left",position:"relative",boxShadow:"0 2px 8px rgba(0,0,0,.03)"}}>
            <div style={{fontSize:24,marginBottom:6}}>{item.emoji}</div>
            <div style={{fontSize:15,fontWeight:700,color:T.text}}>{item.name}</div>
            <div style={{fontSize:14,fontWeight:600,color:T.accent,marginTop:4}}>{formatPrice(item.price)}</div>
            {inCart&&<div style={{position:"absolute",top:8,right:8,background:T.accent,color:"#fff",width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,boxShadow:"0 2px 6px rgba(201,162,39,.3)"}}>{inCart.qty}</div>}
          </button>)})}
      </div>
      {cart.length>0&&(<div className="glass" style={{position:"fixed",bottom:0,left:0,right:0,background:"linear-gradient(180deg,rgba(255,253,250,.96),rgba(248,244,237,.98))",borderTop:`1px solid ${T.borderLight}`,padding:"12px 16px",boxShadow:"0 -4px 24px rgba(0,0,0,.06)"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          {cart.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:T.accentLight,fontSize:13,fontWeight:600,color:T.text}}><span>{c.name} ×{c.qty}</span><button onClick={e=>{e.stopPropagation();removeFromCart(c.id)}} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:T.red,padding:0}}>×</button></div>))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><span style={{fontSize:14,color:T.textSub}}>합계 </span><span style={{fontSize:22,fontWeight:800,color:T.text}}>{formatPrice(cartTotal)}</span></div>
          <button onClick={()=>setStep("select-payment")} style={{padding:"14px 32px",borderRadius:T.rs,background:T.cardGold,color:"#fff",border:"none",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>다음 →</button>
        </div>
      </div>)}
    </div>);

  // ── Payment Selection ──
  if(step==="select-payment")return(
    <div style={{minHeight:"100vh",background:T.pageBgGrad,fontFamily:F}}>
      <Header title="결제 방식 선택" onBack={()=>setStep("select-menu")}/>
      <Steps steps={stepNames} current={stepIdx}/>
      <div style={{padding:"24px 16px"}}>
        <div style={{padding:20,borderRadius:T.r,background:T.cardBg,border:`1px solid ${T.borderLight}`,marginBottom:24,boxShadow:"0 2px 10px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
          <div style={{fontSize:14,color:T.textSub,marginBottom:8}}>{selectedMember.name} 님 주문 내역</div>
          {cart.map(c=>(<div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15}}><span>{c.name} ×{c.qty}</span><span style={{fontWeight:700}}>{formatPrice(c.price*c.qty)}</span></div>))}
          <div style={{borderTop:`2px solid ${T.border}`,marginTop:12,paddingTop:12,display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:800}}>
            <span>합계</span><span style={{color:T.accent}}>{formatPrice(cartTotal)}</span>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {PAYS.map(pm=>(<button key={pm.id} onClick={()=>{setPaymentMethod(pm.id);setStep("confirm")}} className="hov" style={{padding:"24px 20px",borderRadius:T.r,border:`1px solid ${T.borderLight}`,background:T.cardBg,cursor:"pointer",display:"flex",alignItems:"center",gap:16,fontSize:20,fontWeight:700,boxShadow:"0 2px 10px rgba(0,0,0,.03)"}}>
            <span style={{fontSize:36}}>{pm.icon}</span>
            <div style={{textAlign:"left"}}><div style={{color:T.text}}>{pm.label}</div>
              {pm.id==="credit"&&<div style={{fontSize:13,fontWeight:500,color:T.orange,marginTop:2}}>현재 외상: {formatPrice(getMemberBalance(selectedMember.id))}</div>}
            </div>
          </button>))}
        </div>
      </div>
    </div>);

  // ── Confirm ──
  if(step==="confirm"){const pm=PAYS.find(p=>p.id===paymentMethod);return(
    <div style={{minHeight:"100vh",background:T.pageBgGrad,fontFamily:F}}>
      <Header title="주문 확인" onBack={()=>setStep("select-payment")}/>
      <Steps steps={stepNames} current={stepIdx}/>
      <div style={{padding:"24px 16px",textAlign:"center"}}>
        <div style={{padding:28,borderRadius:T.r,background:T.cardBg,border:`1px solid ${T.borderLight}`,boxShadow:"0 4px 20px rgba(0,0,0,.05),0 1px 0 rgba(255,255,255,.7) inset"}}>
          <div style={{fontSize:17,color:T.textSub,marginBottom:4}}>주문자</div>
          <div style={{fontSize:28,fontWeight:800,marginBottom:20,color:T.text}}>{selectedMember.name}</div>
          {cart.map(c=>(<div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontSize:16,borderBottom:`1px solid ${T.borderLight}`}}><span>{c.name} ×{c.qty}</span><span style={{fontWeight:700}}>{formatPrice(c.price*c.qty)}</span></div>))}
          <div style={{marginTop:16,paddingTop:16,borderTop:`2px solid ${T.border}`,fontSize:26,fontWeight:800,color:T.accent}}>{formatPrice(cartTotal)}</div>
          <div style={{marginTop:10,display:"inline-flex",alignItems:"center",gap:8,padding:"8px 20px",borderRadius:20,background:pm.bg,fontSize:16,fontWeight:700,color:pm.color}}>{pm.icon} {pm.label}</div>
        </div>
        <div style={{display:"flex",gap:12,marginTop:24}}>
          <button onClick={()=>setStep("select-payment")} style={{flex:1,padding:16,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:16,fontWeight:600,cursor:"pointer",color:T.text}}>← 뒤로</button>
          <button onClick={completeOrder} style={{flex:2,padding:16,borderRadius:T.rs,border:"none",background:T.cardGreen,color:"#fff",fontSize:18,fontWeight:800,cursor:"pointer",boxShadow:"0 3px 12px rgba(90,154,110,.25)"}}>✓ 주문 완료</button>
        </div>
      </div>
    </div>)}

  // ── Done ──
  if(step==="done")return(
    <div style={{minHeight:"100vh",background:T.pageBgGrad,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:F}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:20,boxShadow:"0 4px 16px rgba(90,154,110,.15)"}}>✓</div>
      <h2 style={{fontSize:24,fontWeight:800,marginBottom:8,color:T.text}}>주문 완료!</h2>
      <p style={{fontSize:16,color:T.textSub}}>{selectedMember.name} 님 — {formatPrice(cartTotal)}</p>
      <button onClick={resetOrder} style={{marginTop:32,padding:"16px 48px",borderRadius:T.rs,background:T.cardGold,color:"#fff",border:"none",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(201,162,39,.2)"}}>새 주문 접수</button>
    </div>);
  return null;
}

// ─── Summary Modal ────────────────────────────────────
function SummaryModal({orders,onClose}){
  const cash=orders.filter(o=>o.paymentMethod==="cash").reduce((s,o)=>s+o.total,0);
  const transfer=orders.filter(o=>o.paymentMethod==="transfer").reduce((s,o)=>s+o.total,0);
  const credit=orders.filter(o=>o.paymentMethod==="credit").reduce((s,o)=>s+o.total,0);
  return(<div style={{position:"fixed",inset:0,background:"rgba(58,54,50,.35)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,backdropFilter:"blur(10px)"}} onClick={onClose}>
    <div style={{background:T.cardBgFlat,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,maxHeight:"80vh",overflow:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:20,fontWeight:800,color:T.text}}>📊 오늘 정산</h3>
        <button onClick={onClose} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",width:34,height:34,borderRadius:10,fontSize:18,cursor:"pointer",color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
        {[{l:"총 매출",v:formatPrice(cash+transfer+credit),bg:T.accentLight,c:T.accent},{l:"주문 수",v:`${orders.length}건`,bg:T.accentLight,c:T.accent},{l:"현금",v:formatPrice(cash),bg:T.greenLight,c:T.green},{l:"계좌이체",v:formatPrice(transfer),bg:T.blueLight,c:T.blue},{l:"외상",v:formatPrice(credit),bg:T.orangeLight,c:T.orange}].map(s=>(<div key={s.l} style={{padding:16,borderRadius:T.rs,background:s.bg}}><div style={{fontSize:11,color:T.textSub,fontWeight:600,marginBottom:4}}>{s.l}</div><div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div></div>))}
      </div>
      <h4 style={{fontSize:15,fontWeight:700,marginBottom:10,color:T.text}}>최근 주문</h4>
      {orders.length===0?<p style={{color:T.textSub,fontSize:14,textAlign:"center",padding:20}}>오늘 주문이 없습니다</p>:orders.slice(0,10).map(o=>(<div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.borderLight}`}}>
        <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>{o.memberName}</div><div style={{fontSize:12,color:T.textSub}}>{o.items.map(i=>`${i.name}×${i.qty}`).join(", ")} · {o.time}</div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:700}}>{formatPrice(o.total)}</div><div style={{fontSize:11,fontWeight:600,color:PAYS.find(p=>p.id===o.paymentMethod)?.color}}>{PAYS.find(p=>p.id===o.paymentMethod)?.label}</div></div>
      </div>))}
    </div>
  </div>);
}

// ─── Credit Management Modal ──────────────────────────
function CreditMgmtModal({orders,creditPayments,setCreditPayments,getMemberBalance,onClose}){
  const withCredit=MEMBERS.map(m=>({...m,balance:getMemberBalance(m.id)})).filter(m=>m.balance>0).sort((a,b)=>b.balance-a.balance);
  const handlePay=(m)=>{if(confirm(`${m.name} 님의 외상 ${formatPrice(m.balance)}을(를) 정산 처리하시겠습니까?`)){setCreditPayments(p=>[...p,{id:Date.now(),memberId:m.id,amount:m.balance,method:"cash",time:now()}])}};
  return(<div style={{position:"fixed",inset:0,background:"rgba(58,54,50,.35)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100,backdropFilter:"blur(10px)"}} onClick={onClose}>
    <div style={{background:T.cardBgFlat,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:480,maxHeight:"80vh",overflow:"auto",padding:24}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:20,fontWeight:800,color:T.text}}>💰 외상 관리</h3>
        <button onClick={onClose} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",width:34,height:34,borderRadius:10,fontSize:18,cursor:"pointer",color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{padding:16,borderRadius:T.rs,background:T.orangeLight,marginBottom:20,textAlign:"center"}}>
        <div style={{fontSize:12,color:T.textSub}}>총 미정산 외상</div>
        <div style={{fontSize:28,fontWeight:800,color:T.orange}}>{formatPrice(withCredit.reduce((s,m)=>s+m.balance,0))}</div>
        <div style={{fontSize:12,color:T.textSub}}>{withCredit.length}명</div>
      </div>
      {withCredit.length===0?<p style={{color:T.textSub,fontSize:14,textAlign:"center",padding:20}}>외상 잔액이 없습니다 🎉</p>:withCredit.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${T.borderLight}`}}>
        <div><div style={{fontSize:16,fontWeight:700,color:T.text}}>{m.name}</div><div style={{fontSize:20,fontWeight:800,color:T.orange}}>{formatPrice(m.balance)}</div></div>
        <button onClick={()=>handlePay(m)} style={{padding:"10px 20px",borderRadius:T.rs,background:T.cardGreen,color:"#fff",border:"none",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(90,154,110,.2)"}}>정산 완료</button>
      </div>))}
    </div>
  </div>);
}

// ─── Lookup Screen ────────────────────────────────────
function LookupScreen({onBack,orders,creditPayments}){
  const[sel,setSel]=useState(null);const[search,setSearch]=useState("");const[cho,setCho]=useState(null);
  const getMemberBalance=(mid)=>{const cr=orders.filter(o=>o.memberId===mid&&o.paymentMethod==="credit").reduce((s,o)=>s+o.total,0);const pd=creditPayments.filter(cp=>cp.memberId===mid).reduce((s,cp)=>s+cp.amount,0);return cr-pd};
  const filtered=MEMBERS.filter(m=>{if(search)return m.name.includes(search);if(cho)return m.group===cho;return true});
  const mOrders=sel?orders.filter(o=>o.memberId===sel.id).slice(0,15):[];

  if(sel)return(<div style={{minHeight:"100vh",background:T.pageBgGrad,fontFamily:F}}>
    <div className="glass" style={{padding:"14px 16px",background:"linear-gradient(180deg,rgba(255,253,250,.96),rgba(248,244,237,.94))",borderBottom:`1px solid ${T.borderLight}`,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:5,boxShadow:"0 1px 12px rgba(0,0,0,.03)"}}>
      <button onClick={()=>setSel(null)} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",width:36,height:36,borderRadius:10,fontSize:18,cursor:"pointer"}}>←</button>
      <h2 style={{fontSize:18,fontWeight:700,color:T.text}}>{sel.name} 님</h2>
    </div>
    <div style={{padding:16}}>
      <div style={{padding:24,borderRadius:T.r,background:T.cardBg,border:`1px solid ${T.borderLight}`,textAlign:"center",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
        <div style={{fontSize:14,color:T.textSub,marginBottom:8}}>외상 잔액</div>
        <div style={{fontSize:36,fontWeight:900,color:getMemberBalance(sel.id)>0?T.orange:T.green}}>{getMemberBalance(sel.id)>0?formatPrice(getMemberBalance(sel.id)):"없음 ✓"}</div>
      </div>
      <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,color:T.text}}>주문 내역</h3>
      {mOrders.length===0?<p style={{color:T.textSub,fontSize:14,textAlign:"center",padding:20}}>주문 내역이 없습니다</p>:mOrders.map(o=>(<div key={o.id} style={{padding:"14px 16px",borderRadius:T.rs,background:T.cardBg,border:`1px solid ${T.borderLight}`,marginBottom:8,boxShadow:"0 1px 6px rgba(0,0,0,.02)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,color:T.textSub}}>{o.time}</span><span style={{fontSize:12,fontWeight:600,padding:"2px 8px",borderRadius:10,background:PAYS.find(p=>p.id===o.paymentMethod)?.bg,color:PAYS.find(p=>p.id===o.paymentMethod)?.color}}>{PAYS.find(p=>p.id===o.paymentMethod)?.label}</span></div>
        <div style={{fontSize:15,color:T.text}}>{o.items.map(i=>`${i.name} ×${i.qty}`).join(", ")}</div>
        <div style={{fontSize:17,fontWeight:800,marginTop:4,color:T.text}}>{formatPrice(o.total)}</div>
      </div>))}
    </div>
  </div>);

  return(<div style={{minHeight:"100vh",background:T.pageBgGrad,fontFamily:F}}>
    <div className="glass" style={{padding:"14px 16px",background:"linear-gradient(180deg,rgba(255,253,250,.96),rgba(248,244,237,.94))",borderBottom:`1px solid ${T.borderLight}`,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:5,boxShadow:"0 1px 12px rgba(0,0,0,.03)"}}>
      <button onClick={onBack} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",width:36,height:36,borderRadius:10,fontSize:18,cursor:"pointer"}}>←</button>
      <div><h2 style={{fontSize:18,fontWeight:700,color:T.text}}>👀 내 외상 조회</h2><p style={{fontSize:12,color:T.textSub}}>이름을 터치하여 확인하세요</p></div>
    </div>
    <div style={{padding:"12px 16px 0"}}><input type="text" placeholder="이름 검색..." value={search} onChange={e=>{setSearch(e.target.value);setCho(null)}} style={{width:"100%",padding:"16px",borderRadius:T.rs,border:`2px solid ${T.borderLight}`,fontSize:18,fontFamily:F,background:T.cardBgFlat}}/></div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"10px 16px"}}>
      <button onClick={()=>setCho(null)} style={{padding:"10px 16px",borderRadius:10,border:"none",background:!cho?T.accent:T.cardBgFlat,color:!cho?"#fff":T.text,fontSize:16,fontWeight:600,cursor:"pointer"}}>전체</button>
      {CHOSUNG.filter(c=>MEMBERS.some(m=>m.group===c)).map(c=>(<button key={c} onClick={()=>{setCho(c);setSearch("")}} style={{padding:"10px 16px",borderRadius:10,border:"none",background:cho===c?T.accent:T.cardBgFlat,color:cho===c?"#fff":T.text,fontSize:16,fontWeight:600,cursor:"pointer"}}>{c}</button>))}
    </div>
    <div style={{padding:"0 16px 40px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
      {filtered.map(m=>{const bal=getMemberBalance(m.id);return(<button key={m.id} onClick={()=>setSel(m)} className="hov" style={{padding:"20px 12px",borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBg,cursor:"pointer",textAlign:"center",fontSize:19,fontWeight:700,color:T.text,boxShadow:"0 2px 8px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
        {m.name}{bal>0&&<div style={{fontSize:12,color:T.orange,fontWeight:600,marginTop:4}}>외상 {formatPrice(bal)}</div>}
      </button>)})}
    </div>
  </div>);
}

// ─── App Root ─────────────────────────────────────────
export default function RodemCafePOS(){
  const[mode,setMode]=useState(null);
  const[orders,setOrders]=useState([]);
  const[creditPayments,setCreditPayments]=useState([]);
  return(<><style>{CSS}</style>
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:T.pageBg}}>
      {mode===null&&<ModeSelector onSelect={m=>setMode(m==="pos"?"pin":m)}/>}
      {mode==="pin"&&<PinEntry onSuccess={()=>setMode("pos")} onBack={()=>setMode(null)}/>}
      {mode==="pos"&&<POSScreen onBack={()=>setMode(null)} orders={orders} setOrders={setOrders} creditPayments={creditPayments} setCreditPayments={setCreditPayments}/>}
      {mode==="lookup"&&<LookupScreen onBack={()=>setMode(null)} orders={orders} creditPayments={creditPayments}/>}
    </div>
  </>);
}
