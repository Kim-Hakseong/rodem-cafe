import { useState } from "react";

// ─── Theme ────────────────────────────────────────────
const T={pageBg:"#eae6df",pageBgGrad:"linear-gradient(145deg,#efebe4 0%,#e5e0d8 50%,#dedad2 100%)",cardBg:"linear-gradient(160deg,#fefcf9 0%,#f8f4ec 100%)",cardBgFlat:"#faf7f1",cardBgWarm:"linear-gradient(145deg,#fef9f0 0%,#f6f0e2 100%)",cardDark:"linear-gradient(145deg,#4a4541 0%,#3a3632 100%)",cardGold:"linear-gradient(135deg,#f2d76a 0%,#dbb44a 40%,#c9a020 100%)",cardGreen:"linear-gradient(135deg,#6ab07e 0%,#4a9060 100%)",cardPurple:"linear-gradient(135deg,#8b6fd4 0%,#6a4fb4 100%)",text:"#2c2825",textSub:"#8a8278",textLight:"#a8a196",border:"#e8e3da",borderLight:"#f0ece4",accent:"#c9a227",accentLight:"#f8f1d8",green:"#5a9a6e",greenLight:"#eaf5ee",blue:"#4a7fd4",blueLight:"#eaf0fa",orange:"#d49a4a",orangeLight:"#fcf2e4",purple:"#7c5fbf",purpleLight:"#f0ebfa",red:"#c45050",r:22,rs:14};
const F="'Plus Jakarta Sans','Noto Sans KR',sans-serif";
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:10px}.hov{transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s cubic-bezier(.2,.8,.2,1)}.hov:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.06)}.glass{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}button{transition:all .2s cubic-bezier(.2,.8,.2,1);font-family:${F}}button:active{transform:scale(.97)}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;
const formatW=n=>n.toLocaleString()+"원";
const now=()=>{const d=new Date();return`${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`};
const PAY_L={cash:"현금",transfer:"계좌이체",credit:"외상",prepaid:"선불"};
const PAY_C={cash:T.green,transfer:T.blue,credit:T.orange,prepaid:T.purple};

const MEMBERS_INIT=[{id:1,name:"김영희",balance:28000},{id:2,name:"김철수",balance:15000},{id:3,name:"김은혜",balance:0},{id:4,name:"박수진",balance:42000},{id:5,name:"박정훈",balance:3000},{id:6,name:"이서연",balance:0},{id:7,name:"이현우",balance:8500},{id:8,name:"장미란",balance:60000},{id:9,name:"정다은",balance:1500},{id:10,name:"최윤아",balance:0},{id:11,name:"홍길동",balance:25000},{id:12,name:"한소율",balance:5000}];
const MENUS=[{id:1,name:"아메리카노(HOT)",price:2000,emoji:"☕"},{id:2,name:"아메리카노(ICE)",price:2500,emoji:"🧊"},{id:3,name:"카페라떼(HOT)",price:3000,emoji:"☕"},{id:4,name:"카페라떼(ICE)",price:3500,emoji:"🧊"},{id:5,name:"바닐라라떼",price:3500,emoji:"☕"},{id:6,name:"녹차라떼",price:3500,emoji:"🍵"},{id:7,name:"유자차",price:3000,emoji:"🍋"},{id:8,name:"핫초코",price:3000,emoji:"🍫"}];
const QUICK=[10000,20000,30000,50000];

function Header({title,onBack}){
  return(<div className="glass" style={{background:T.cardDark,color:"#fff",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 16px rgba(60,55,50,.12)"}}>
    {onBack&&<button onClick={onBack} style={{background:"rgba(255,255,255,.1)",border:"none",color:"#fff",width:36,height:36,borderRadius:10,fontSize:18,cursor:"pointer"}}>←</button>}
    <h2 style={{fontSize:17,fontWeight:700,flex:1,letterSpacing:-.3}}>{title}</h2>
  </div>);
}

function Toast({msg}){return(<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",padding:"14px 28px",borderRadius:12,background:T.cardPurple,color:"#fff",fontSize:15,fontWeight:700,boxShadow:"0 8px 30px rgba(0,0,0,.15)",zIndex:100,animation:"fadeUp .3s ease"}}>{msg}</div>)}

export default function PrepaidSystem(){
  const[members,setMembers]=useState(MEMBERS_INIT);
  const[screen,setScreen]=useState("home");
  const[sel,setSel]=useState(null);
  const[topupAmt,setTopupAmt]=useState("");const[topupMethod,setTopupMethod]=useState(null);
  const[cart,setCart]=useState([]);const[shortOpt,setShortOpt]=useState(null);const[splitMethod,setSplitMethod]=useState(null);
  const[orders,setOrders]=useState([]);const[topupHistory,setTopupHistory]=useState([]);const[toast,setToast]=useState(null);
  const showToast=m=>{setToast(m);setTimeout(()=>setToast(null),2500)};
  const cartTotal=cart.reduce((s,c)=>s+c.price*c.qty,0);
  const bal=sel?members.find(m=>m.id===sel.id)?.balance||0:0;
  const shortage=cartTotal-bal;
  const resetOrder=()=>{setScreen("home");setSel(null);setCart([]);setShortOpt(null);setSplitMethod(null)};
  const updateBal=(mid,d)=>setMembers(p=>p.map(m=>m.id===mid?{...m,balance:m.balance+d}:m));
  const addToCart=menu=>setCart(p=>{const i=p.findIndex(c=>c.id===menu.id);if(i>=0){const n=[...p];n[i]={...n[i],qty:n[i].qty+1};return n}return[...p,{...menu,qty:1}]});
  const removeFromCart=id=>setCart(p=>{const i=p.findIndex(c=>c.id===id);if(i<0)return p;if(p[i].qty===1)return p.filter(c=>c.id!==id);const n=[...p];n[i]={...n[i],qty:n[i].qty-1};return n});

  const handleTopup=()=>{const a=parseInt(topupAmt);if(!a||a<=0||!topupMethod)return;updateBal(sel.id,a);setTopupHistory(p=>[{id:Date.now(),memberId:sel.id,memberName:sel.name,amount:a,method:topupMethod,time:now()},...p]);showToast(`${sel.name} 님 ${formatW(a)} 충전 완료`);setScreen("home");setSel(null);setTopupAmt("");setTopupMethod(null)};
  const completeOrder=()=>{let pays=[];if(bal>=cartTotal){updateBal(sel.id,-cartTotal);pays=[{method:"prepaid",amount:cartTotal}]}else if(shortage>0&&shortOpt==="credit"){updateBal(sel.id,-bal);pays=[...(bal>0?[{method:"prepaid",amount:bal}]:[]),{method:"credit",amount:bal>0?shortage:cartTotal}]}else if(shortage>0&&shortOpt==="split"&&splitMethod){updateBal(sel.id,-bal);pays=[...(bal>0?[{method:"prepaid",amount:bal}]:[]),{method:splitMethod,amount:bal>0?shortage:cartTotal}]};setOrders(p=>[{id:Date.now(),memberId:sel.id,memberName:sel.name,items:cart.map(c=>({name:c.name,qty:c.qty,price:c.price})),total:cartTotal,payments:pays,time:now()},...p]);setScreen("order-done")};

  const MemberBtn=({m,onClick})=>(<button onClick={onClick} className="hov" style={{padding:16,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBg,cursor:"pointer",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
    <div style={{fontSize:17,fontWeight:700,color:T.text}}>{m.name}</div>
    <div style={{fontSize:14,fontWeight:800,marginTop:6,color:m.balance>0?T.purple:T.textLight}}>{m.balance>0?formatW(m.balance):"잔액 없음"}</div>
  </button>);

  // ─── HOME ───
  if(screen==="home"){const totalDep=members.reduce((s,m)=>s+m.balance,0);const activeN=members.filter(m=>m.balance>0).length;
  return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title="🌿 로뎀나무 — 선불 충전 관리"/>
    <div style={{maxWidth:520,margin:"0 auto",padding:"16px 16px 80px"}}>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,padding:16,borderRadius:T.r,background:T.cardPurple,color:"#fff",position:"relative",overflow:"hidden",boxShadow:"0 6px 24px rgba(124,95,191,.2)"}}>
          <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.1)",filter:"blur(8px)"}}/>
          <div style={{fontSize:11,opacity:.7,fontWeight:600,position:"relative",zIndex:1}}>총 선불 잔액</div>
          <div style={{fontSize:24,fontWeight:800,marginTop:4,position:"relative",zIndex:1}}>{formatW(totalDep)}</div>
          <div style={{fontSize:12,opacity:.6,marginTop:2,position:"relative",zIndex:1}}>{activeN}명 보유</div>
        </div>
        <div style={{flex:1,padding:16,borderRadius:T.r,background:T.cardBg,border:`1px solid ${T.borderLight}`,boxShadow:"0 2px 10px rgba(0,0,0,.03)"}}>
          <div style={{fontSize:11,color:T.textSub,fontWeight:600}}>오늘 충전</div>
          <div style={{fontSize:24,fontWeight:800,color:T.purple,marginTop:4}}>{formatW(topupHistory.reduce((s,h)=>s+h.amount,0))}</div>
          <div style={{fontSize:12,color:T.textSub,marginTop:2}}>{topupHistory.length}건</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <button onClick={()=>setScreen("topup")} style={{flex:1,padding:"18px 16px",borderRadius:T.r,border:"none",background:T.cardPurple,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(124,95,191,.2)"}}><span style={{fontSize:22}}>💰</span>충전하기</button>
        <button onClick={()=>setScreen("order")} style={{flex:1,padding:"18px 16px",borderRadius:T.r,border:"none",background:T.cardGold,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(201,162,39,.2)"}}><span style={{fontSize:22}}>☕</span>선불 주문</button>
      </div>
      <button onClick={()=>setScreen("history")} style={{width:"100%",padding:14,borderRadius:T.r,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:T.text}}>📋 충전·사용 내역</button>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10,display:"flex",justifyContent:"space-between",color:T.text}}><span>성도별 선불 잔액</span><span style={{color:T.textSub,fontWeight:500}}>{members.length}명</span></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{members.sort((a,b)=>b.balance-a.balance).map(m=>(<div key={m.id} style={{padding:"14px 10px",borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,color:T.text}}>{m.name}</div><div style={{fontSize:14,fontWeight:800,marginTop:4,color:m.balance>0?T.purple:T.textLight}}>{m.balance>0?formatW(m.balance):"-"}</div></div>))}</div>
    </div>{toast&&<Toast msg={toast}/>}
  </div>);}

  // ─── TOPUP SELECT ───
  if(screen==="topup")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title="💰 충전 — 성도 선택" onBack={()=>{setScreen("home");setSel(null)}}/>
    <div style={{maxWidth:520,margin:"0 auto",padding:16}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{members.map(m=>(<MemberBtn key={m.id} m={m} onClick={()=>{setSel(m);setScreen("topup-amount")}}/>))}</div>
    </div>
  </div>);

  // ─── TOPUP AMOUNT ───
  if(screen==="topup-amount")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title={`💰 ${sel.name} 님 충전`} onBack={()=>{setScreen("topup");setTopupAmt("");setTopupMethod(null)}}/>
    <div style={{maxWidth:520,margin:"0 auto",padding:16}}>
      <div style={{padding:20,borderRadius:T.r,textAlign:"center",marginBottom:20,background:T.cardPurple,color:"#fff",position:"relative",overflow:"hidden",boxShadow:"0 6px 20px rgba(124,95,191,.2)"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.1)",filter:"blur(8px)"}}/>
        <div style={{fontSize:13,opacity:.7,position:"relative",zIndex:1}}>현재 잔액</div>
        <div style={{fontSize:32,fontWeight:800,position:"relative",zIndex:1}}>{formatW(bal)}</div>
      </div>
      <div style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:8}}>빠른 충전</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
        {QUICK.map(a=>(<button key={a} onClick={()=>setTopupAmt(String(a))} style={{padding:"14px 8px",borderRadius:T.rs,border:topupAmt===String(a)?`2px solid ${T.purple}`:`1px solid ${T.borderLight}`,background:topupAmt===String(a)?T.purpleLight:T.cardBgFlat,fontSize:15,fontWeight:700,cursor:"pointer",color:topupAmt===String(a)?T.purple:T.text}}>{(a/10000).toFixed(0)}만원</button>))}
      </div>
      <div style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:8}}>직접 입력</div>
      <div style={{position:"relative",marginBottom:20}}>
        <input type="number" placeholder="금액 입력" value={topupAmt} onChange={e=>setTopupAmt(e.target.value)} style={{width:"100%",padding:"16px 50px 16px 16px",borderRadius:T.rs,border:`2px solid ${T.borderLight}`,fontSize:20,fontWeight:700,fontFamily:F,background:T.cardBgFlat}}/>
        <span style={{position:"absolute",right:16,top:"50%",transform:"translateY(-50%)",fontSize:16,color:T.textSub,fontWeight:600}}>원</span>
      </div>
      <div style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:8}}>수납 방법</div>
      <div style={{display:"flex",gap:10,marginBottom:24}}>
        {[{id:"cash",label:"현금",icon:"💵",c:T.green,bg:T.greenLight},{id:"transfer",label:"계좌이체",icon:"🏦",c:T.blue,bg:T.blueLight}].map(pm=>(<button key={pm.id} onClick={()=>setTopupMethod(pm.id)} style={{flex:1,padding:"18px 14px",borderRadius:T.rs,border:topupMethod===pm.id?`2px solid ${pm.c}`:`1px solid ${T.borderLight}`,background:topupMethod===pm.id?pm.bg:T.cardBgFlat,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontSize:16,fontWeight:700,color:topupMethod===pm.id?pm.c:T.text}}><span style={{fontSize:22}}>{pm.icon}</span>{pm.label}</button>))}
      </div>
      {topupAmt&&parseInt(topupAmt)>0&&(<div style={{padding:16,borderRadius:T.rs,background:T.purpleLight,border:`1px solid rgba(124,95,191,.15)`,marginBottom:16,fontSize:14}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:T.textSub}}>현재 잔액</span><span style={{fontWeight:700}}>{formatW(bal)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{color:T.purple,fontWeight:600}}>+ 충전</span><span style={{fontWeight:700,color:T.purple}}>+{formatW(parseInt(topupAmt))}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",borderTop:`2px solid rgba(124,95,191,.2)`,paddingTop:8,marginTop:4}}><span style={{fontWeight:800}}>충전 후 잔액</span><span style={{fontWeight:800,fontSize:20,color:T.purple}}>{formatW(bal+parseInt(topupAmt))}</span></div>
      </div>)}
      <button onClick={handleTopup} disabled={!topupAmt||parseInt(topupAmt)<=0||!topupMethod} style={{width:"100%",padding:18,borderRadius:T.rs,border:"none",background:topupAmt&&parseInt(topupAmt)>0&&topupMethod?T.cardPurple:"#d4cec7",color:"#fff",fontSize:18,fontWeight:800,cursor:topupAmt&&topupMethod?"pointer":"not-allowed",boxShadow:topupAmt&&topupMethod?"0 4px 16px rgba(124,95,191,.2)":"none"}}>✓ 충전 완료</button>
    </div>
  </div>);

  // ─── ORDER SELECT ───
  if(screen==="order")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title="☕ 선불 주문 — 성도 선택" onBack={resetOrder}/>
    <div style={{maxWidth:520,margin:"0 auto",padding:16}}>
      <div style={{padding:12,borderRadius:T.rs,background:T.purpleLight,marginBottom:14,fontSize:13,color:T.purple,fontWeight:600}}>💡 잔액 부족 시 외상 또는 현금/이체 추가 결제 가능</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>{members.map(m=>(<MemberBtn key={m.id} m={m} onClick={()=>{setSel(m);setScreen("order-menu")}}/>))}</div>
    </div>
  </div>);

  // ─── ORDER MENU ───
  if(screen==="order-menu")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title={`☕ ${sel.name} 님 주문`} onBack={()=>{setScreen("order");setCart([]);setSel(null)}}/>
    <div style={{background:T.cardBgFlat,borderBottom:`1px solid ${T.borderLight}`,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14,color:T.textSub}}>선불 잔액</span><span style={{fontSize:18,fontWeight:800,color:T.purple}}>{formatW(bal)}</span></div>
      {cart.length>0&&<div style={{fontSize:13,fontWeight:700,color:bal>=cartTotal?T.green:T.orange}}>{bal>=cartTotal?`✓ 결제 가능 (잔여 ${formatW(bal-cartTotal)})`:`⚠ ${formatW(cartTotal-bal)} 부족`}</div>}
    </div>
    <div style={{maxWidth:520,margin:"0 auto",padding:"12px 16px 120px"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
        {MENUS.map(item=>{const inCart=cart.find(c=>c.id===item.id);return(<button key={item.id} onClick={()=>addToCart(item)} className="hov" style={{padding:14,borderRadius:T.rs,textAlign:"left",border:inCart?`2px solid ${T.accent}`:`1px solid ${T.borderLight}`,background:inCart?T.accentLight:T.cardBg,cursor:"pointer",position:"relative",boxShadow:"0 2px 8px rgba(0,0,0,.03)"}}>
          <div style={{fontSize:22,marginBottom:4}}>{item.emoji}</div>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>{item.name}</div>
          <div style={{fontSize:14,fontWeight:600,color:T.accent,marginTop:4}}>{formatW(item.price)}</div>
          {inCart&&<div style={{position:"absolute",top:8,right:8,background:T.accent,color:"#fff",width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,boxShadow:"0 2px 6px rgba(201,162,39,.3)"}}>{inCart.qty}</div>}
        </button>)})}
      </div>
    </div>
    {cart.length>0&&<div className="glass" style={{position:"fixed",bottom:0,left:0,right:0,background:"linear-gradient(180deg,rgba(255,253,250,.96),rgba(248,244,237,.98))",borderTop:`1px solid ${T.borderLight}`,padding:"12px 16px",boxShadow:"0 -4px 24px rgba(0,0,0,.06)"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{cart.map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:20,background:T.accentLight,fontSize:13,fontWeight:600,color:T.text}}>{c.name}×{c.qty}<button onClick={e=>{e.stopPropagation();removeFromCart(c.id)}} style={{background:"none",border:"none",color:T.red,fontSize:16,cursor:"pointer",padding:0}}>×</button></div>))}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><span style={{fontSize:14,color:T.textSub}}>합계 </span><span style={{fontSize:22,fontWeight:800}}>{formatW(cartTotal)}</span></div>
          <button onClick={()=>bal>=cartTotal?setScreen("order-pay"):setScreen("order-shortage")} style={{padding:"14px 32px",borderRadius:T.rs,background:T.cardGold,color:"#fff",border:"none",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>다음 →</button>
        </div>
      </div>
    </div>}
  </div>);

  // ─── ORDER PAY (full balance) ───
  if(screen==="order-pay")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title="선불 결제 확인" onBack={()=>setScreen("order-menu")}/>
    <div style={{maxWidth:520,margin:"0 auto",padding:20}}>
      <div style={{padding:24,borderRadius:T.r,background:T.cardBg,border:`1px solid ${T.borderLight}`,textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,.04),0 1px 0 rgba(255,255,255,.7) inset"}}>
        <div style={{fontSize:15,color:T.textSub,marginBottom:4}}>주문자</div>
        <div style={{fontSize:26,fontWeight:800,marginBottom:20,color:T.text}}>{sel.name}</div>
        {cart.map(c=>(<div key={c.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:15}}><span>{c.name} ×{c.qty}</span><span style={{fontWeight:700}}>{formatW(c.price*c.qty)}</span></div>))}
        <div style={{borderTop:`2px solid ${T.border}`,marginTop:14,paddingTop:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:14,color:T.textSub}}><span>선불 잔액</span><span>{formatW(bal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:14,color:T.purple,fontWeight:600}}><span>- 차감</span><span>-{formatW(cartTotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",borderTop:`2px solid ${T.border}`,paddingTop:10,marginTop:6,fontSize:20,fontWeight:800}}><span>결제 후 잔액</span><span style={{color:T.purple}}>{formatW(bal-cartTotal)}</span></div>
        </div>
        <div style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:20,background:T.purpleLight,color:T.purple,fontSize:15,fontWeight:700}}>💰 선불 결제</div>
      </div>
      <div style={{display:"flex",gap:12,marginTop:24}}>
        <button onClick={()=>setScreen("order-menu")} style={{flex:1,padding:16,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:16,fontWeight:600,cursor:"pointer",color:T.text}}>← 뒤로</button>
        <button onClick={completeOrder} style={{flex:2,padding:16,borderRadius:T.rs,border:"none",background:T.cardGreen,color:"#fff",fontSize:18,fontWeight:800,cursor:"pointer",boxShadow:"0 3px 12px rgba(90,154,110,.25)"}}>✓ 결제 완료</button>
      </div>
    </div>
  </div>);

  // ─── ORDER SHORTAGE ───
  if(screen==="order-shortage")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title="⚠️ 잔액 부족" onBack={()=>{setScreen("order-menu");setShortOpt(null);setSplitMethod(null)}}/>
    <div style={{maxWidth:520,margin:"0 auto",padding:20}}>
      <div style={{padding:20,borderRadius:T.r,background:T.cardBg,border:`1px solid ${T.borderLight}`,marginBottom:20,boxShadow:"0 2px 10px rgba(0,0,0,.03)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:15}}><span style={{color:T.textSub}}>주문 금액</span><span style={{fontWeight:700}}>{formatW(cartTotal)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:15}}><span style={{color:T.purple}}>선불 잔액</span><span style={{fontWeight:700,color:T.purple}}>{formatW(bal)}</span></div>
        <div style={{display:"flex",justifyContent:"space-between",borderTop:`2px solid ${T.border}`,paddingTop:10,marginTop:4}}>
          <span style={{fontSize:16,fontWeight:800,color:T.orange}}>부족 금액</span><span style={{fontSize:22,fontWeight:800,color:T.orange}}>{formatW(shortage)}</span>
        </div>
      </div>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10,color:T.textSub}}>부족분 처리 방법</div>
      <button onClick={()=>{setShortOpt("credit");setSplitMethod(null)}} className="hov" style={{width:"100%",padding:"20px 18px",borderRadius:T.r,marginBottom:10,border:shortOpt==="credit"?`2px solid ${T.orange}`:`1px solid ${T.borderLight}`,background:shortOpt==="credit"?T.orangeLight:T.cardBg,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(0,0,0,.03)"}}>
        <div style={{width:44,height:44,borderRadius:12,background:T.orangeLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📋</div>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:T.text}}>부족분 외상 처리</div><div style={{fontSize:13,color:T.textSub,marginTop:2}}>{bal>0?`선불 ${formatW(bal)} + 외상 ${formatW(shortage)}`:`전액 외상 ${formatW(cartTotal)}`}</div></div>
        <div style={{width:22,height:22,borderRadius:"50%",border:shortOpt==="credit"?"none":`2px solid ${T.border}`,background:shortOpt==="credit"?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14}}>{shortOpt==="credit"?"✓":""}</div>
      </button>
      <button onClick={()=>setShortOpt("split")} className="hov" style={{width:"100%",padding:"20px 18px",borderRadius:T.r,marginBottom:10,border:shortOpt==="split"?`2px solid ${T.blue}`:`1px solid ${T.borderLight}`,background:shortOpt==="split"?T.blueLight:T.cardBg,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(0,0,0,.03)"}}>
        <div style={{width:44,height:44,borderRadius:12,background:T.blueLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>💳</div>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:T.text}}>부족분 현금/이체</div><div style={{fontSize:13,color:T.textSub,marginTop:2}}>{bal>0?`선불 ${formatW(bal)} + 추가 ${formatW(shortage)}`:`전액 현금/이체 ${formatW(cartTotal)}`}</div></div>
        <div style={{width:22,height:22,borderRadius:"50%",border:shortOpt==="split"?"none":`2px solid ${T.border}`,background:shortOpt==="split"?T.blue:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14}}>{shortOpt==="split"?"✓":""}</div>
      </button>
      {shortOpt==="split"&&<div style={{padding:16,borderRadius:T.rs,background:T.cardBgFlat,border:`1px solid ${T.borderLight}`,marginBottom:10}}>
        <div style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:10}}>부족분 {formatW(shortage)} 결제 방법</div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setSplitMethod("cash")} style={{flex:1,padding:14,borderRadius:T.rs,border:splitMethod==="cash"?`2px solid ${T.green}`:`1px solid ${T.borderLight}`,background:splitMethod==="cash"?T.greenLight:T.cardBgFlat,fontSize:15,fontWeight:700,cursor:"pointer",color:splitMethod==="cash"?T.green:T.text}}>💵 현금</button>
          <button onClick={()=>setSplitMethod("transfer")} style={{flex:1,padding:14,borderRadius:T.rs,border:splitMethod==="transfer"?`2px solid ${T.blue}`:`1px solid ${T.borderLight}`,background:splitMethod==="transfer"?T.blueLight:T.cardBgFlat,fontSize:15,fontWeight:700,cursor:"pointer",color:splitMethod==="transfer"?T.blue:T.text}}>🏦 계좌이체</button>
        </div>
      </div>}
      {(shortOpt==="credit"||(shortOpt==="split"&&splitMethod))&&<>
        <div style={{padding:16,borderRadius:T.rs,background:T.cardBg,border:`1px solid ${T.borderLight}`,marginTop:10,marginBottom:16,boxShadow:"0 1px 6px rgba(0,0,0,.02)"}}>
          <div style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:10}}>결제 요약</div>
          {bal>0&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:14}}><span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:2,background:T.purple,display:"inline-block"}}/>선불 차감</span><span style={{fontWeight:700,color:T.purple}}>{formatW(bal)}</span></div>}
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:14}}><span style={{display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:2,display:"inline-block",background:shortOpt==="credit"?T.orange:splitMethod==="cash"?T.green:T.blue}}/>{shortOpt==="credit"?"외상":splitMethod==="cash"?"현금":"계좌이체"}</span><span style={{fontWeight:700,color:shortOpt==="credit"?T.orange:splitMethod==="cash"?T.green:T.blue}}>{formatW(bal>0?shortage:cartTotal)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",borderTop:`2px solid ${T.border}`,paddingTop:8,marginTop:6,fontSize:17,fontWeight:800}}><span>총 결제</span><span>{formatW(cartTotal)}</span></div>
        </div>
        <button onClick={completeOrder} style={{width:"100%",padding:18,borderRadius:T.rs,border:"none",background:T.cardGreen,color:"#fff",fontSize:18,fontWeight:800,cursor:"pointer",boxShadow:"0 3px 12px rgba(90,154,110,.25)"}}>✓ 결제 완료</button>
      </>}
    </div>
  </div>);

  // ─── ORDER DONE ───
  if(screen==="order-done"){const lastOrder=orders[0];return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}><style>{CSS}</style>
    <div style={{width:80,height:80,borderRadius:"50%",background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:20,boxShadow:"0 4px 16px rgba(90,154,110,.15)"}}>✓</div>
    <h2 style={{fontSize:24,fontWeight:800,marginBottom:8,color:T.text}}>주문 완료!</h2>
    <p style={{fontSize:16,color:T.textSub,marginBottom:8}}>{sel.name} 님 — {formatW(cartTotal)}</p>
    {lastOrder&&<div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center",marginBottom:8}}>{lastOrder.payments.map((p,i)=>(<span key={i} style={{padding:"5px 14px",borderRadius:16,background:p.method==="prepaid"?T.purpleLight:p.method==="credit"?T.orangeLight:p.method==="cash"?T.greenLight:T.blueLight,color:PAY_C[p.method],fontSize:13,fontWeight:700}}>{PAY_L[p.method]} {formatW(p.amount)}</span>))}</div>}
    <p style={{fontSize:14,color:T.purple,fontWeight:700}}>남은 선불 잔액: {formatW(members.find(m=>m.id===sel.id)?.balance||0)}</p>
    <button onClick={resetOrder} style={{marginTop:28,padding:"16px 48px",borderRadius:T.rs,background:T.cardGold,color:"#fff",border:"none",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(201,162,39,.2)"}}>새 주문</button>
  </div>);}

  // ─── HISTORY ───
  if(screen==="history")return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}><style>{CSS}</style>
    <Header title="📋 충전·사용 내역" onBack={()=>setScreen("home")}/>
    <div style={{maxWidth:520,margin:"0 auto",padding:16}}>
      <div style={{fontSize:14,fontWeight:700,marginBottom:10,color:T.text}}>💰 충전 내역</div>
      {topupHistory.length===0?<div style={{padding:20,textAlign:"center",color:T.textSub,background:T.cardBgFlat,borderRadius:T.rs,marginBottom:20,border:`1px solid ${T.borderLight}`}}>충전 내역 없음</div>:topupHistory.map(h=>(<div key={h.id} style={{padding:"14px 16px",borderRadius:T.rs,background:T.cardBg,border:`1px solid ${T.borderLight}`,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 1px 6px rgba(0,0,0,.02)"}}>
        <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>{h.memberName}</div><div style={{fontSize:12,color:T.textSub}}>{h.time} · {PAY_L[h.method]}</div></div>
        <div style={{fontSize:17,fontWeight:800,color:T.purple}}>+{formatW(h.amount)}</div>
      </div>))}
      <div style={{fontSize:14,fontWeight:700,marginBottom:10,marginTop:20,color:T.text}}>☕ 선불 사용 내역</div>
      {orders.length===0?<div style={{padding:20,textAlign:"center",color:T.textSub,background:T.cardBgFlat,borderRadius:T.rs,border:`1px solid ${T.borderLight}`}}>주문 내역 없음</div>:orders.map(o=>(<div key={o.id} style={{padding:"14px 16px",borderRadius:T.rs,background:T.cardBg,border:`1px solid ${T.borderLight}`,marginBottom:6,boxShadow:"0 1px 6px rgba(0,0,0,.02)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{fontSize:15,fontWeight:700,color:T.text}}>{o.memberName}</div><div style={{fontSize:15,fontWeight:800}}>{formatW(o.total)}</div></div>
        <div style={{fontSize:12,color:T.textSub,marginBottom:4}}>{o.items.map(i=>`${i.name}×${i.qty}`).join(", ")} · {o.time}</div>
        <div style={{display:"flex",gap:6}}>{o.payments.map((p,i)=>(<span key={i} style={{padding:"3px 10px",borderRadius:12,background:p.method==="prepaid"?T.purpleLight:p.method==="credit"?T.orangeLight:p.method==="cash"?T.greenLight:T.blueLight,color:PAY_C[p.method],fontSize:11,fontWeight:700}}>{PAY_L[p.method]} {formatW(p.amount)}</span>))}</div>
      </div>))}
    </div>
  </div>);
  return null;
}
