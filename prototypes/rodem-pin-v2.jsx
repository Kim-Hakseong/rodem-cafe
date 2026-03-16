import { useState, useEffect } from "react";

// ─── Theme ────────────────────────────────────────────
const T={pageBg:"#eae6df",pageBgGrad:"linear-gradient(145deg,#efebe4 0%,#e5e0d8 50%,#dedad2 100%)",cardBg:"linear-gradient(160deg,#fefcf9 0%,#f8f4ec 100%)",cardBgFlat:"#faf7f1",cardBgWarm:"linear-gradient(145deg,#fef9f0 0%,#f6f0e2 100%)",cardDark:"linear-gradient(145deg,#4a4541 0%,#3a3632 100%)",cardGold:"linear-gradient(135deg,#f2d76a 0%,#dbb44a 40%,#c9a020 100%)",cardGreen:"linear-gradient(135deg,#6ab07e 0%,#4a9060 100%)",text:"#2c2825",textSub:"#8a8278",textLight:"#a8a196",border:"#e8e3da",borderLight:"#f0ece4",accent:"#c9a227",accentLight:"#f8f1d8",green:"#5a9a6e",greenLight:"#eaf5ee",blue:"#4a7fd4",blueLight:"#eaf0fa",red:"#c45050",r:22,rs:14};
const F="'Plus Jakarta Sans','Noto Sans KR',sans-serif";
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}button{transition:all .2s cubic-bezier(.2,.8,.2,1);font-family:${F}}button:active{transform:scale(.97)}input:focus{outline:none;border-color:${T.accent}!important}`;
const DEFAULT_PIN="000000";const RECOVERY_EMAIL="admin@cjnambu.kr";const DEMO_CODE="123456";

function usePinStore(){const[pin,setPin]=useState(()=>{try{return window.__RODEM_PIN||DEFAULT_PIN}catch{return DEFAULT_PIN}});const[email,setEmail]=useState(RECOVERY_EMAIL);const update=p=>{setPin(p);window.__RODEM_PIN=p};return{pin,update,email,setEmail}}

function Numpad({onKey,disabled}){
  return(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,maxWidth:270}}>
    {["1","2","3","4","5","6","7","8","9","clear","0","del"].map(k=>(<button key={k} disabled={disabled} onClick={()=>onKey(k)} style={{width:80,height:56,borderRadius:12,border:`1px solid ${T.borderLight}`,background:"linear-gradient(180deg,#fff 0%,#f8f6f2 100%)",color:k==="clear"?T.red:T.text,fontSize:k==="clear"||k==="del"?13:22,fontWeight:600,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.3:1}}>{k==="del"?"⌫":k==="clear"?"초기화":k}</button>))}
  </div>);
}
function Dots({length,filled,error,success}){
  return(<div style={{display:"flex",gap:14,marginBottom:28}}>
    {Array.from({length},(_,i)=>(<div key={i} style={{width:13,height:13,borderRadius:"50%",background:filled>i?(error?T.red:success?T.green:T.accent):T.border,transition:"all .25s cubic-bezier(.2,.8,.2,1)",transform:filled>i?"scale(1.2)":"scale(1)",boxShadow:filled>i&&!error?"0 0 8px rgba(201,162,39,.3)":"none"}}/>))}
  </div>);
}
function Page({children}){
  return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,background:T.pageBgGrad,fontFamily:F,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"10%",left:"5%",width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,162,39,.05) 0%,transparent 70%)"}}/>
    <div style={{position:"absolute",bottom:"12%",right:"8%",width:200,height:200,borderRadius:"50%",background:"radial-gradient(circle,rgba(90,154,110,.04) 0%,transparent 70%)"}}/>
    <div style={{position:"relative",zIndex:1,width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>{children}</div>
  </div>);
}
function BackBtn({onClick}){return(<button onClick={onClick} style={{position:"absolute",top:20,left:20,background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",color:T.textSub,fontSize:14,cursor:"pointer",padding:"8px 14px",borderRadius:10,zIndex:2}}>← 뒤로</button>)}

// ─── Login ────────────────────────────────────────────
function PinLogin({correctPin,onSuccess,onForgot}){
  const[pin,setPin]=useState("");const[error,setError]=useState(false);const[attempts,setAttempts]=useState(0);const[locked,setLocked]=useState(false);const[lockTimer,setLockTimer]=useState(0);
  useEffect(()=>{if(lockTimer>0){const t=setTimeout(()=>setLockTimer(lockTimer-1),1000);return()=>clearTimeout(t)}else if(locked&&lockTimer===0){setLocked(false);setAttempts(0)}},[lockTimer,locked]);
  const handleKey=k=>{if(locked)return;if(k==="del"){setPin(p=>p.slice(0,-1));setError(false);return}if(k==="clear"){setPin("");setError(false);return}if(pin.length>=6)return;const next=pin+k;setPin(next);if(next.length===6){if(next===correctPin)setTimeout(()=>onSuccess(),300);else{setError(true);const na=attempts+1;setAttempts(na);if(na>=5){setLocked(true);setLockTimer(30)}setTimeout(()=>{setPin("");setError(false)},600)}}};
  return(<Page>
    <div style={{fontSize:52,marginBottom:12,filter:"drop-shadow(0 2px 8px rgba(0,0,0,.06))"}}>🌿</div>
    <h1 style={{fontSize:26,fontWeight:800,color:T.text,marginBottom:4}}>로뎀나무</h1>
    <p style={{color:T.textSub,fontSize:14,marginBottom:36}}>관리자 PIN 6자리</p>
    <Dots length={6} filled={pin.length} error={error}/>
    {error&&!locked&&<p style={{color:T.red,fontSize:14,fontWeight:600,marginBottom:12}}>PIN이 틀렸습니다 ({attempts}/5)</p>}
    {locked&&<div style={{padding:"10px 24px",borderRadius:10,background:"rgba(196,80,80,.1)",marginBottom:16,textAlign:"center"}}><p style={{color:T.red,fontSize:14,fontWeight:700}}>🔒 5회 실패 — {lockTimer}초 후 재시도</p></div>}
    <Numpad onKey={handleKey} disabled={locked}/>
    <button onClick={onForgot} style={{marginTop:32,background:"none",border:"none",color:T.textSub,fontSize:14,fontWeight:600,cursor:"pointer",textDecoration:"underline",textUnderlineOffset:3}}>PIN을 잊으셨나요?</button>
    <p style={{marginTop:20,fontSize:11,color:T.textLight}}>데모 PIN: {correctPin}</p>
  </Page>);
}

// ─── Recovery ─────────────────────────────────────────
function PinRecovery({recoveryEmail,onResetSuccess,onBack}){
  const[step,setStep]=useState("verify-email");const[email,setEmail]=useState("");const[code,setCode]=useState("");const[newPin,setNewPin]=useState("");const[confirmPin,setConfirmPin]=useState("");const[error,setError]=useState("");const[timer,setTimer]=useState(0);
  useEffect(()=>{if(timer>0){const t=setTimeout(()=>setTimer(timer-1),1000);return()=>clearTimeout(t)}},[timer]);
  const masked=recoveryEmail.replace(/(.{2})(.*)(@.*)/,(_,a,b,c)=>a+"*".repeat(b.length)+c);
  const inputStyle={width:"100%",padding:"16px 18px",borderRadius:12,border:`2px solid ${T.borderLight}`,background:T.cardBgFlat,color:T.text,fontSize:16,fontFamily:F};

  const handlePinKey=k=>{
    const isNew=step==="new-pin";const setter=isNew?setNewPin:setConfirmPin;const getter=isNew?newPin:confirmPin;
    if(k==="del"){setter(p=>p.slice(0,-1));setError("");return}if(k==="clear"){setter("");setError("");return}if(getter.length>=6)return;
    const next=getter+k;setter(next);
    if(next.length===6){if(isNew)setTimeout(()=>setStep("confirm-pin"),400);else{if(next===newPin){onResetSuccess(next);setStep("done")}else{setError("PIN이 일치하지 않습니다");setTimeout(()=>{setConfirmPin("");setError("")},800)}}}
  };

  if(step==="verify-email")return(<Page><BackBtn onClick={onBack}/>
    <div style={{fontSize:44,marginBottom:16}}>🔑</div>
    <h2 style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:8}}>PIN 찾기</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:8,textAlign:"center"}}>등록된 이메일로 인증번호를 보내드립니다</p>
    <p style={{color:T.textLight,fontSize:13,marginBottom:28}}>힌트: {masked}</p>
    <div style={{width:"100%",maxWidth:320}}>
      <input type="email" placeholder="등록된 이메일" value={email} onChange={e=>{setEmail(e.target.value);setError("")}} style={{...inputStyle,borderColor:error?T.red:T.borderLight}}/>
      {error&&<p style={{color:T.red,fontSize:13,marginTop:6,fontWeight:600}}>{error}</p>}
      <button onClick={()=>{if(!email.includes("@")){setError("올바른 이메일을 입력하세요");return}if(email.toLowerCase()!==recoveryEmail.toLowerCase()){setError("등록된 이메일과 불일치");return}setError("");setStep("code-sent");setTimer(180)}} style={{width:"100%",marginTop:14,padding:16,borderRadius:12,border:"none",background:T.cardGold,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>인증번호 전송</button>
    </div>
    <p style={{marginTop:24,fontSize:11,color:T.textLight}}>데모: {recoveryEmail} → 인증번호 {DEMO_CODE}</p>
  </Page>);

  if(step==="code-sent")return(<Page><BackBtn onClick={()=>setStep("verify-email")}/>
    <div style={{fontSize:44,marginBottom:16}}>📩</div>
    <h2 style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:8}}>인증번호 입력</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:6}}>{masked}으로 전송된 6자리</p>
    {timer>0&&<p style={{color:T.textSub,fontSize:13,marginBottom:24}}>⏱ {Math.floor(timer/60)}:{String(timer%60).padStart(2,"0")}</p>}
    <div style={{width:"100%",maxWidth:320}}>
      <input type="text" maxLength={6} placeholder="인증번호 6자리" value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,""));setError("")}} style={{...inputStyle,fontSize:24,fontWeight:800,textAlign:"center",letterSpacing:8,borderColor:error?T.red:T.borderLight}}/>
      {error&&<p style={{color:T.red,fontSize:13,marginTop:6,fontWeight:600}}>{error}</p>}
      <button onClick={()=>{if(code===DEMO_CODE){setError("");setStep("new-pin")}else setError("인증번호 불일치")}} disabled={code.length<6} style={{width:"100%",marginTop:14,padding:16,borderRadius:12,border:"none",background:code.length===6?T.cardGold:"#d4cec7",color:"#fff",fontSize:16,fontWeight:700,cursor:code.length===6?"pointer":"not-allowed"}}>확인</button>
      <button onClick={()=>{setTimer(180);setCode("")}} disabled={timer>150} style={{width:"100%",marginTop:8,padding:12,borderRadius:12,border:`1px solid ${T.borderLight}`,background:"transparent",color:timer>150?T.textLight:T.textSub,fontSize:14,fontWeight:600,cursor:timer>150?"not-allowed":"pointer"}}>인증번호 재전송</button>
    </div>
  </Page>);

  if(step==="new-pin"||step==="confirm-pin")return(<Page>
    <div style={{fontSize:44,marginBottom:16}}>{step==="new-pin"?"🔐":"✅"}</div>
    <h2 style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:8}}>{step==="new-pin"?"새 PIN 설정":"PIN 확인"}</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:32}}>{step==="new-pin"?"새로운 6자리 PIN":"한 번 더 입력해주세요"}</p>
    <Dots length={6} filled={step==="new-pin"?newPin.length:confirmPin.length} error={!!error}/>
    {error&&<p style={{color:T.red,fontSize:14,fontWeight:600,marginBottom:12}}>{error}</p>}
    <Numpad onKey={handlePinKey}/>
    {step==="confirm-pin"&&<button onClick={()=>{setStep("new-pin");setNewPin("");setConfirmPin("");setError("")}} style={{marginTop:20,background:"none",border:"none",color:T.textSub,fontSize:14,cursor:"pointer",textDecoration:"underline"}}>PIN 다시 입력</button>}
  </Page>);

  if(step==="done")return(<Page>
    <div style={{width:80,height:80,borderRadius:"50%",background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:20,boxShadow:"0 4px 16px rgba(90,154,110,.15)"}}>✓</div>
    <h2 style={{color:T.text,fontSize:24,fontWeight:800,marginBottom:8}}>PIN 변경 완료!</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:32}}>새로운 PIN으로 로그인해주세요</p>
    <button onClick={onBack} style={{padding:"16px 48px",borderRadius:12,border:"none",background:T.cardGold,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>로그인으로 돌아가기</button>
  </Page>);
  return null;
}

// ─── PIN Change ───────────────────────────────────────
function PinChange({currentPin,onChangeSuccess,onBack}){
  const[step,setStep]=useState("current");const[inputPin,setInputPin]=useState("");const[newPin,setNewPin]=useState("");const[confirmPin,setConfirmPin]=useState("");const[error,setError]=useState("");
  const handleKey=k=>{const setter=step==="current"?setInputPin:step==="new"?setNewPin:setConfirmPin;const getter=step==="current"?inputPin:step==="new"?newPin:confirmPin;
    if(k==="del"){setter(p=>p.slice(0,-1));setError("");return}if(k==="clear"){setter("");setError("");return}if(getter.length>=6)return;
    const next=getter+k;setter(next);
    if(next.length===6){if(step==="current"){if(next===currentPin)setTimeout(()=>{setStep("new");setError("")},400);else{setError("현재 PIN 불일치");setTimeout(()=>{setInputPin("");setError("")},800)}}else if(step==="new"){if(next===currentPin){setError("현재와 다른 번호를 입력하세요");setTimeout(()=>{setNewPin("");setError("")},800)}else setTimeout(()=>{setStep("confirm");setError("")},400)}else{if(next===newPin){onChangeSuccess(next);setStep("done")}else{setError("PIN 불일치");setTimeout(()=>{setConfirmPin("");setError("")},800)}}}};

  if(step==="done")return(<Page>
    <div style={{width:80,height:80,borderRadius:"50%",background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:20,boxShadow:"0 4px 16px rgba(90,154,110,.15)"}}>✓</div>
    <h2 style={{color:T.text,fontSize:24,fontWeight:800,marginBottom:8}}>PIN 변경 완료!</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:32}}>새 PIN이 적용되었습니다</p>
    <button onClick={onBack} style={{padding:"16px 48px",borderRadius:12,border:"none",background:T.cardGold,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>돌아가기</button>
  </Page>);

  const titles={current:{icon:"🔒",t:"현재 PIN 입력",d:"현재 사용 중인 6자리"},new:{icon:"🔐",t:"새 PIN 입력",d:"변경할 6자리"},confirm:{icon:"✅",t:"새 PIN 확인",d:"한 번 더 입력"}};
  const t=titles[step];const filledLen=step==="current"?inputPin.length:step==="new"?newPin.length:confirmPin.length;
  const steps=["현재 PIN","새 PIN","확인"];const stepIdx=["current","new","confirm"].indexOf(step);

  return(<Page><BackBtn onClick={onBack}/>
    <div style={{display:"flex",gap:8,marginBottom:28,width:"100%",maxWidth:280}}>
      {steps.map((s,i)=>(<div key={s} style={{flex:1,textAlign:"center",paddingBottom:8,borderBottom:`3px solid ${i<=stepIdx?T.accent:T.borderLight}`,transition:"all .3s"}}><span style={{fontSize:12,fontWeight:i<=stepIdx?700:500,color:i<=stepIdx?T.text:T.textLight}}>{s}</span></div>))}
    </div>
    <div style={{fontSize:44,marginBottom:12}}>{t.icon}</div>
    <h2 style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:6}}>{t.t}</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:28}}>{t.d}</p>
    <Dots length={6} filled={filledLen} error={!!error}/>
    {error&&<p style={{color:T.red,fontSize:14,fontWeight:600,marginBottom:12}}>{error}</p>}
    <Numpad onKey={handleKey}/>
    {step==="confirm"&&<button onClick={()=>{setStep("new");setNewPin("");setConfirmPin("");setError("")}} style={{marginTop:20,background:"none",border:"none",color:T.textSub,fontSize:14,cursor:"pointer",textDecoration:"underline"}}>새 PIN 다시 입력</button>}
  </Page>);
}

// ─── Email Change ─────────────────────────────────────
function EmailChange({currentPin,currentEmail,onSave,onBack}){
  const[step,setStep]=useState("pin");const[pin,setPin]=useState("");const[email,setEmail]=useState("");const[error,setError]=useState("");
  const handlePinKey=k=>{if(k==="del"){setPin(p=>p.slice(0,-1));setError("");return}if(k==="clear"){setPin("");setError("");return}if(pin.length>=6)return;const next=pin+k;setPin(next);if(next.length===6){if(next===currentPin)setTimeout(()=>setStep("input"),400);else{setError("PIN 불일치");setTimeout(()=>{setPin("");setError("")},800)}}};
  const inputStyle={width:"100%",padding:"16px 18px",borderRadius:12,border:`2px solid ${error?T.red:T.borderLight}`,background:T.cardBgFlat,color:T.text,fontSize:16,fontFamily:F};

  if(step==="pin")return(<Page><BackBtn onClick={onBack}/>
    <div style={{fontSize:44,marginBottom:16}}>🔒</div>
    <h2 style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:8}}>본인 확인</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:32}}>이메일 변경을 위해 현재 PIN 입력</p>
    <Dots length={6} filled={pin.length} error={!!error}/>
    {error&&<p style={{color:T.red,fontSize:14,fontWeight:600,marginBottom:12}}>{error}</p>}
    <Numpad onKey={handlePinKey}/>
  </Page>);

  if(step==="input")return(<Page><BackBtn onClick={onBack}/>
    <div style={{fontSize:44,marginBottom:16}}>📧</div>
    <h2 style={{color:T.text,fontSize:22,fontWeight:800,marginBottom:8}}>복구 이메일 변경</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:6}}>현재: {currentEmail.replace(/(.{2})(.*)(@.*)/,(_,a,b,c)=>a+"***"+c)}</p>
    <p style={{color:T.textLight,fontSize:13,marginBottom:28}}>PIN 분실 시 이 이메일로 인증번호 전송</p>
    <div style={{width:"100%",maxWidth:320}}>
      <input type="email" placeholder="새 이메일 주소" value={email} onChange={e=>{setEmail(e.target.value);setError("")}} style={inputStyle}/>
      {error&&<p style={{color:T.red,fontSize:13,marginTop:6,fontWeight:600}}>{error}</p>}
      <button onClick={()=>{if(!email.includes("@")||!email.includes(".")){setError("올바른 이메일을 입력하세요");return}onSave(email);setStep("done")}} style={{width:"100%",marginTop:14,padding:16,borderRadius:12,border:"none",background:T.cardGold,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>변경 완료</button>
    </div>
  </Page>);

  return(<Page>
    <div style={{width:80,height:80,borderRadius:"50%",background:T.greenLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,marginBottom:20,boxShadow:"0 4px 16px rgba(90,154,110,.15)"}}>✓</div>
    <h2 style={{color:T.text,fontSize:24,fontWeight:800,marginBottom:8}}>이메일 변경 완료!</h2>
    <p style={{color:T.textSub,fontSize:14,marginBottom:32}}>{email}</p>
    <button onClick={onBack} style={{padding:"16px 48px",borderRadius:12,border:"none",background:T.cardGold,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(201,162,39,.2)"}}>돌아가기</button>
  </Page>);
}

// ─── Settings Home ────────────────────────────────────
function SettingsHome({onChangePin,onChangeEmail,recoveryEmail,onLogout}){
  const masked=recoveryEmail.replace(/(.{2})(.*)(@.*)/,(_,a,b,c)=>a+"*".repeat(Math.min(b.length,6))+c);
  return(<div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}>
    <div className="glass" style={{background:T.cardDark,color:"#fff",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 16px rgba(60,55,50,.12)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>🌿</span><h1 style={{fontSize:17,fontWeight:800}}>PIN 관리</h1></div>
      <button onClick={onLogout} style={{background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.85)",padding:"7px 14px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>🔒 잠금</button>
    </div>
    <div style={{maxWidth:480,margin:"0 auto",padding:20}}>
      <div style={{background:T.cardBg,borderRadius:T.r,padding:20,border:`1px solid ${T.borderLight}`,marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
        <div style={{fontSize:13,color:T.textSub,fontWeight:600,marginBottom:12}}>현재 설정</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${T.borderLight}`}}>
          <div><div style={{fontSize:14,fontWeight:700,color:T.text}}>관리자 PIN</div><div style={{fontSize:13,color:T.textSub,marginTop:2}}>●●●●●●</div></div>
          <span style={{fontSize:12,padding:"4px 10px",borderRadius:6,background:T.greenLight,color:T.green,fontWeight:700}}>활성</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:14,fontWeight:700,color:T.text}}>복구 이메일</div><div style={{fontSize:13,color:T.textSub,marginTop:2}}>{masked}</div></div>
          <span style={{fontSize:12,padding:"4px 10px",borderRadius:6,background:T.blueLight,color:T.blue,fontWeight:700}}>등록됨</span>
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[{fn:onChangePin,icon:"🔐",bg:T.accentLight,t:"PIN 변경",d:"현재 PIN → 새 PIN → 확인"},{fn:onChangeEmail,icon:"📧",bg:T.blueLight,t:"복구 이메일 변경",d:"PIN 분실 시 인증번호 수신 주소"}].map(item=>(<button key={item.t} onClick={item.fn} className="hov" style={{display:"flex",alignItems:"center",gap:14,padding:"20px 18px",borderRadius:T.r,border:`1px solid ${T.borderLight}`,background:T.cardBg,cursor:"pointer",textAlign:"left",boxShadow:"0 2px 10px rgba(0,0,0,.03),0 1px 0 rgba(255,255,255,.7) inset"}}>
          <div style={{width:44,height:44,borderRadius:12,background:item.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{item.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:T.text}}>{item.t}</div><div style={{fontSize:13,color:T.textSub,marginTop:2}}>{item.d}</div></div>
          <span style={{fontSize:18,color:T.textLight}}>›</span>
        </button>))}
      </div>
      <div style={{marginTop:24,padding:18,borderRadius:T.r,background:T.accentLight,fontSize:13,lineHeight:1.8,color:T.accent}}>
        <div style={{fontWeight:700,marginBottom:6}}>🛡️ 보안 안내</div>
        <div>• 생년월일·연속 숫자(123456) 사용 금지</div>
        <div>• 복구 이메일은 본인만 접근 가능한 주소 사용</div>
        <div>• PIN은 3개월마다 변경 권장</div>
      </div>
    </div>
  </div>);
}

// ─── App Root ─────────────────────────────────────────
export default function PinManager(){
  const{pin,update,email,setEmail}=usePinStore();
  const[screen,setScreen]=useState("login");
  return(<><style>{CSS}</style>
    {screen==="login"&&<PinLogin correctPin={pin} onSuccess={()=>setScreen("settings")} onForgot={()=>setScreen("forgot")}/>}
    {screen==="forgot"&&<PinRecovery recoveryEmail={email} onResetSuccess={p=>update(p)} onBack={()=>setScreen("login")}/>}
    {screen==="settings"&&<SettingsHome recoveryEmail={email} onChangePin={()=>setScreen("change-pin")} onChangeEmail={()=>setScreen("change-email")} onLogout={()=>setScreen("login")}/>}
    {screen==="change-pin"&&<PinChange currentPin={pin} onChangeSuccess={p=>update(p)} onBack={()=>setScreen("settings")}/>}
    {screen==="change-email"&&<EmailChange currentPin={pin} currentEmail={email} onSave={e=>setEmail(e)} onBack={()=>setScreen("settings")}/>}
  </>);
}
