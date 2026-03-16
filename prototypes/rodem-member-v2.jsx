import { useState, useRef, useMemo } from "react";

// ─── Theme ────────────────────────────────────────────
const T={pageBg:"#eae6df",pageBgGrad:"linear-gradient(145deg,#efebe4 0%,#e5e0d8 50%,#dedad2 100%)",cardBg:"linear-gradient(160deg,#fefcf9 0%,#f8f4ec 100%)",cardBgFlat:"#faf7f1",cardBgWarm:"linear-gradient(145deg,#fef9f0 0%,#f6f0e2 100%)",cardDark:"linear-gradient(145deg,#4a4541 0%,#3a3632 100%)",cardGold:"linear-gradient(135deg,#f2d76a 0%,#dbb44a 40%,#c9a020 100%)",cardGreen:"linear-gradient(135deg,#6ab07e 0%,#4a9060 100%)",text:"#2c2825",textSub:"#8a8278",textLight:"#a8a196",border:"#e8e3da",borderLight:"#f0ece4",accent:"#c9a227",accentLight:"#f8f1d8",green:"#5a9a6e",greenLight:"#eaf5ee",blue:"#4a7fd4",blueLight:"#eaf0fa",orange:"#d49a4a",orangeLight:"#fcf2e4",red:"#c45050",redLight:"#fce8e8",r:22,rs:14};
const F="'Plus Jakarta Sans','Noto Sans KR',sans-serif";
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');*{margin:0;padding:0;box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:10px}.hov{transition:transform .3s cubic-bezier(.2,.8,.2,1),box-shadow .3s cubic-bezier(.2,.8,.2,1)}.hov:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.06)}.glass{backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}button{transition:all .2s cubic-bezier(.2,.8,.2,1);font-family:${F}}button:active{transform:scale(.97)}input,select,textarea{font-family:${F}}input:focus,select:focus,textarea:focus{outline:none;border-color:${T.accent}!important}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`;

const INIT=[
  {id:1,name:"김영희",phone:"010-1234-5678",group:"1구역",note:"",createdAt:"2025-01-01"},
  {id:2,name:"김철수",phone:"010-2345-6789",group:"1구역",note:"디카페인 선호",createdAt:"2025-01-01"},
  {id:3,name:"김은혜",phone:"010-3456-7890",group:"2구역",note:"",createdAt:"2025-01-01"},
  {id:4,name:"김성민",phone:"",group:"2구역",note:"",createdAt:"2025-01-01"},
  {id:5,name:"김하늘",phone:"010-5678-9012",group:"3구역",note:"아이스만",createdAt:"2025-01-01"},
  {id:6,name:"나은영",phone:"",group:"1구역",note:"",createdAt:"2025-01-01"},
  {id:7,name:"노병석",phone:"010-7890-1234",group:"3구역",note:"",createdAt:"2025-01-15"},
  {id:8,name:"류미정",phone:"",group:"2구역",note:"우유 알레르기",createdAt:"2025-01-15"},
  {id:9,name:"박수진",phone:"010-9012-3456",group:"1구역",note:"",createdAt:"2025-02-01"},
  {id:10,name:"박정훈",phone:"",group:"3구역",note:"",createdAt:"2025-02-01"},
  {id:11,name:"박민서",phone:"010-1111-2222",group:"2구역",note:"",createdAt:"2025-02-01"},
  {id:12,name:"서영주",phone:"",group:"1구역",note:"설탕X",createdAt:"2025-03-01"},
  {id:13,name:"손지현",phone:"010-3333-4444",group:"3구역",note:"",createdAt:"2025-03-01"},
  {id:14,name:"송태호",phone:"",group:"2구역",note:"",createdAt:"2025-03-01"},
  {id:15,name:"신혜원",phone:"010-5555-6666",group:"1구역",note:"",createdAt:"2025-03-15"},
];
const GROUPS=["전체","1구역","2구역","3구역","미지정"];

function getChosung(c){const code=c.charCodeAt(0);if(code<0xAC00||code>0xD7A3)return"";return"ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"[Math.floor((code-0xAC00)/(21*28))]||""}

async function exportExcel(members){const XLSX=await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");const rows=members.map((m,i)=>({번호:i+1,이름:m.name,연락처:m.phone||"",구역:m.group||"",메모:m.note||"",등록일:m.createdAt}));const ws=XLSX.utils.json_to_sheet(rows);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"성도명단");XLSX.writeFile(wb,`로뎀나무_성도명단_${new Date().toISOString().split("T")[0]}.xlsx`)}

async function parseExcel(file){const XLSX=await import("https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs");return new Promise((res,rej)=>{const r=new FileReader();r.onload=e=>{try{const wb=XLSX.read(e.target.result,{type:"array"});const data=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);res(data.map((row,i)=>({id:Date.now()+i,name:row["이름"]||row["name"]||"",phone:String(row["연락처"]||row["phone"]||""),group:row["구역"]||row["group"]||"미지정",note:row["메모"]||row["note"]||"",createdAt:row["등록일"]||new Date().toISOString().split("T")[0]})).filter(m=>m.name.trim()!==""))}catch(e){rej(e)}};r.onerror=()=>rej(new Error("read fail"));r.readAsArrayBuffer(file)})}

// ─── PIN Gate ─────────────────────────────────────────
function PinGate({onSuccess}){
  const[pin,setPin]=useState("");const[error,setError]=useState(false);
  const handleKey=k=>{if(k==="del"){setPin(p=>p.slice(0,-1));setError(false)}else if(k==="clear"){setPin("");setError(false)}else if(pin.length<6){const next=pin+k;setPin(next);if(next.length===6){if(next==="000000")setTimeout(()=>onSuccess(),200);else{setError(true);setTimeout(()=>{setPin("");setError(false)},800)}}}};
  return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.pageBgGrad,fontFamily:F,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"10%",left:"5%",width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(201,162,39,.06) 0%,transparent 70%)"}}/>
    <div style={{padding:"52px 44px",borderRadius:28,background:"linear-gradient(160deg,rgba(255,253,249,.92) 0%,rgba(248,244,236,.88) 100%)",boxShadow:"0 24px 80px rgba(0,0,0,.08),0 1px 0 rgba(255,255,255,.8) inset",textAlign:"center",border:"1px solid rgba(255,255,255,.6)",backdropFilter:"blur(20px)",position:"relative",zIndex:1}}>
      <div style={{fontSize:48,marginBottom:8}}>🌿</div>
      <h1 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:2}}>성도 관리</h1>
      <p style={{fontSize:13,color:T.textSub,marginBottom:32}}>관리자 PIN 6자리 (데모: 000000)</p>
      <div style={{display:"flex",gap:14,justifyContent:"center",marginBottom:28}}>
        {[0,1,2,3,4,5].map(i=>(<div key={i} style={{width:13,height:13,borderRadius:"50%",background:pin.length>i?(error?T.red:T.accent):T.border,transition:"all .25s",transform:pin.length>i?"scale(1.2)":"scale(1)",boxShadow:pin.length>i&&!error?"0 0 8px rgba(201,162,39,.3)":"none"}}/>))}
      </div>
      {error&&<p style={{color:T.red,fontSize:13,fontWeight:600,marginBottom:12}}>PIN이 틀렸습니다</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
        {["1","2","3","4","5","6","7","8","9","clear","0","del"].map(k=>(<button key={k} onClick={()=>handleKey(k)} style={{width:74,height:54,borderRadius:12,border:`1px solid ${T.borderLight}`,background:"linear-gradient(180deg,#fff 0%,#f8f6f2 100%)",fontSize:k==="clear"||k==="del"?12:22,fontWeight:600,cursor:"pointer",color:k==="clear"?T.red:T.text}}>{k==="del"?"⌫":k==="clear"?"초기화":k}</button>))}
      </div>
    </div>
  </div>);
}

// ─── Form Modal ───────────────────────────────────────
function FormModal({member,onSave,onClose}){
  const[form,setForm]=useState({name:member?.name||"",phone:member?.phone||"",group:member?.group||"미지정",note:member?.note||""});
  const isEdit=!!member;const canSave=form.name.trim().length>0;
  const save=()=>{if(!canSave)return;onSave({...member,id:member?.id||Date.now(),name:form.name.trim(),phone:form.phone.trim(),group:form.group,note:form.note.trim(),createdAt:member?.createdAt||new Date().toISOString().split("T")[0]});onClose()};
  const inputStyle={width:"100%",padding:"12px 14px",borderRadius:T.rs,border:`2px solid ${T.borderLight}`,fontSize:15,background:T.cardBgFlat};
  return(<div style={{position:"fixed",inset:0,background:"rgba(58,54,50,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:20,backdropFilter:"blur(10px)"}} onClick={onClose}>
    <div style={{background:"linear-gradient(160deg,#fefcf8 0%,#f5f1e8 100%)",borderRadius:22,width:"100%",maxWidth:440,padding:28,boxShadow:"0 20px 60px rgba(0,0,0,.12),0 1px 0 rgba(255,255,255,.7) inset",border:"1px solid rgba(255,255,255,.5)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <h3 style={{fontSize:20,fontWeight:800,color:T.text}}>{isEdit?"✏️ 정보 수정":"➕ 새 성도 등록"}</h3>
        <button onClick={onClose} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",width:34,height:34,borderRadius:10,fontSize:18,cursor:"pointer",color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div><label style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:6,display:"block"}}>이름 *</label><input type="text" placeholder="홍길동" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={inputStyle}/></div>
        <div><label style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:6,display:"block"}}>연락처</label><input type="tel" placeholder="010-0000-0000" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} style={inputStyle}/></div>
        <div><label style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:6,display:"block"}}>구역</label><select value={form.group} onChange={e=>setForm(f=>({...f,group:e.target.value}))} style={{...inputStyle,cursor:"pointer"}}>{GROUPS.filter(g=>g!=="전체").map(g=>(<option key={g} value={g}>{g}</option>))}</select></div>
        <div><label style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:6,display:"block"}}>메모</label><textarea placeholder="알레르기, 선호 등" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} rows={2} style={{...inputStyle,resize:"vertical"}}/></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:24}}>
        <button onClick={onClose} style={{flex:1,padding:14,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:16,fontWeight:600,cursor:"pointer",color:T.text}}>취소</button>
        <button onClick={save} disabled={!canSave} style={{flex:2,padding:14,borderRadius:T.rs,border:"none",background:canSave?T.cardGold:"#d4cec7",color:"#fff",fontSize:16,fontWeight:700,cursor:canSave?"pointer":"not-allowed",opacity:canSave?1:.5,boxShadow:canSave?"0 3px 12px rgba(201,162,39,.2)":"none"}}>{isEdit?"수정 완료":"등록"}</button>
      </div>
    </div>
  </div>);
}

// ─── Delete Modal ─────────────────────────────────────
function DeleteModal({member,onConfirm,onClose}){
  return(<div style={{position:"fixed",inset:0,background:"rgba(58,54,50,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:60,padding:20,backdropFilter:"blur(10px)"}} onClick={onClose}>
    <div style={{background:"linear-gradient(160deg,#fefcf8 0%,#f5f1e8 100%)",borderRadius:22,width:"100%",maxWidth:380,padding:28,textAlign:"center",border:"1px solid rgba(255,255,255,.5)",boxShadow:"0 20px 60px rgba(0,0,0,.12)"}} onClick={e=>e.stopPropagation()}>
      <div style={{width:56,height:56,borderRadius:"50%",background:T.redLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>⚠️</div>
      <h3 style={{fontSize:18,fontWeight:800,marginBottom:8,color:T.text}}>성도 삭제</h3>
      <p style={{fontSize:15,color:T.textSub,marginBottom:4}}><strong style={{color:T.text}}>{member.name}</strong> 님을 삭제하시겠습니까?</p>
      <p style={{fontSize:13,color:T.red,marginBottom:24}}>주문·외상 기록도 함께 삭제됩니다.</p>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:14,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:16,fontWeight:600,cursor:"pointer",color:T.text}}>취소</button>
        <button onClick={()=>{onConfirm(member.id);onClose()}} style={{flex:1,padding:14,borderRadius:T.rs,border:"none",background:"linear-gradient(135deg,#d06060,#b84040)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(196,80,80,.2)"}}>삭제</button>
      </div>
    </div>
  </div>);
}

// ─── Import Preview ───────────────────────────────────
function ImportPreview({members,onConfirm,onClose}){
  const[mode,setMode]=useState("append");
  return(<div style={{position:"fixed",inset:0,background:"rgba(58,54,50,.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:20,backdropFilter:"blur(10px)"}} onClick={onClose}>
    <div style={{background:"linear-gradient(160deg,#fefcf8 0%,#f5f1e8 100%)",borderRadius:22,width:"100%",maxWidth:520,maxHeight:"85vh",overflow:"auto",padding:28,border:"1px solid rgba(255,255,255,.5)",boxShadow:"0 20px 60px rgba(0,0,0,.12)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontSize:20,fontWeight:800,color:T.text}}>📥 엑셀 업로드 미리보기</h3>
        <button onClick={onClose} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",width:34,height:34,borderRadius:10,fontSize:18,cursor:"pointer",color:T.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{padding:14,borderRadius:T.rs,background:T.blueLight,marginBottom:16,fontSize:14,color:T.blue,fontWeight:600}}>✓ {members.length}명의 성도 데이터 감지</div>
      <div style={{marginBottom:16}}><div style={{fontSize:13,fontWeight:700,color:T.textSub,marginBottom:8}}>등록 방식</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setMode("append")} style={{flex:1,padding:"12px",borderRadius:T.rs,border:"none",background:mode==="append"?T.cardGold:"linear-gradient(135deg,#fff,#f8f6f2)",color:mode==="append"?"#fff":T.text,fontWeight:700,cursor:"pointer",boxShadow:mode==="append"?"0 2px 8px rgba(201,162,39,.2)":"none"}}>기존 목록에 추가</button>
          <button onClick={()=>setMode("replace")} style={{flex:1,padding:"12px",borderRadius:T.rs,border:"none",background:mode==="replace"?"linear-gradient(135deg,#d06060,#b84040)":"linear-gradient(135deg,#fff,#f8f6f2)",color:mode==="replace"?"#fff":T.text,fontWeight:700,cursor:"pointer"}}>전체 교체</button>
        </div>
        {mode==="replace"&&<p style={{fontSize:12,color:T.red,marginTop:6,fontWeight:600}}>⚠️ 기존 목록이 모두 삭제됩니다</p>}
      </div>
      <div style={{maxHeight:250,overflow:"auto",marginBottom:20,borderRadius:T.rs,border:`1px solid ${T.borderLight}`}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:T.accentLight}}>{["#","이름","연락처","구역","메모"].map(h=>(<th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,fontSize:11,color:T.textSub}}>{h}</th>))}</tr></thead>
          <tbody>{members.slice(0,30).map((m,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.borderLight}`}}><td style={{padding:"8px 12px",color:T.textSub}}>{i+1}</td><td style={{padding:"8px 12px",fontWeight:700}}>{m.name}</td><td style={{padding:"8px 12px",color:T.textSub}}>{m.phone||"-"}</td><td style={{padding:"8px 12px"}}>{m.group}</td><td style={{padding:"8px 12px",color:T.textSub}}>{m.note||"-"}</td></tr>))}</tbody>
        </table>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:14,borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:16,fontWeight:600,cursor:"pointer",color:T.text}}>취소</button>
        <button onClick={()=>{onConfirm(members,mode);onClose()}} style={{flex:2,padding:14,borderRadius:T.rs,border:"none",background:mode==="replace"?"linear-gradient(135deg,#d06060,#b84040)":T.cardGreen,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"}}>{mode==="replace"?`전체 교체 (${members.length}명)`:`추가 등록 (${members.length}명)`}</button>
      </div>
    </div>
  </div>);
}

// ─── Main App ─────────────────────────────────────────
export default function MemberManager(){
  const[authed,setAuthed]=useState(false);
  const[members,setMembers]=useState(INIT);
  const[search,setSearch]=useState("");const[groupFilter,setGroupFilter]=useState("전체");
  const[showForm,setShowForm]=useState(false);const[editMember,setEditMember]=useState(null);
  const[deleteMember,setDeleteMember]=useState(null);const[importPreview,setImportPreview]=useState(null);
  const[toast,setToast]=useState(null);const fileRef=useRef(null);
  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};

  const filtered=useMemo(()=>members.filter(m=>{if(groupFilter!=="전체"&&m.group!==groupFilter)return false;if(search&&!m.name.includes(search)&&!m.phone?.includes(search))return false;return true}).sort((a,b)=>a.name.localeCompare(b.name,"ko")),[members,search,groupFilter]);
  const grouped=useMemo(()=>{const map={};filtered.forEach(m=>{const cs=getChosung(m.name[0])||"기타";if(!map[cs])map[cs]=[];map[cs].push(m)});return Object.entries(map).sort((a,b)=>a[0].localeCompare(b[0],"ko"))},[filtered]);
  const groupCounts=useMemo(()=>{const c={"전체":members.length};members.forEach(m=>{c[m.group]=(c[m.group]||0)+1});return c},[members]);

  const handleSave=m=>{setMembers(p=>{const i=p.findIndex(x=>x.id===m.id);if(i>=0){const n=[...p];n[i]=m;showToast(`${m.name} 님 수정 완료`);return n}showToast(`${m.name} 님 등록 완료`);return[...p,m]})};
  const handleDelete=id=>{const m=members.find(x=>x.id===id);setMembers(p=>p.filter(x=>x.id!==id));showToast(`${m?.name} 님 삭제 완료`,"red")};
  const handleFile=async e=>{const f=e.target.files?.[0];if(!f)return;try{const parsed=await parseExcel(f);if(parsed.length===0){showToast("유효한 데이터 없음","red");return}setImportPreview(parsed)}catch(err){showToast("파일 읽기 실패","red")}e.target.value=""};
  const handleImport=(imp,mode)=>{if(mode==="replace"){setMembers(imp);showToast(`${imp.length}명 전체 교체 완료`)}else{const exist=new Set(members.map(m=>m.name));const nw=imp.filter(m=>!exist.has(m.name));setMembers(p=>[...p,...nw]);showToast(`${nw.length}명 추가 완료`)}};

  if(!authed)return(<><style>{CSS}</style><PinGate onSuccess={()=>setAuthed(true)}/></>);

  return(<><style>{CSS}</style>
    <div style={{fontFamily:F,background:T.pageBgGrad,minHeight:"100vh"}}>
      {/* Header */}
      <div className="glass" style={{background:"linear-gradient(145deg,#4a4541,#3a3632)",color:"#fff",padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20,boxShadow:"0 2px 16px rgba(60,55,50,.12)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:22}}>🌿</span>
          <div><h1 style={{fontSize:17,fontWeight:800}}>성도 관리</h1><p style={{fontSize:11,opacity:.6}}>로뎀나무 카페 · {members.length}명</p></div>
        </div>
        <button onClick={()=>setAuthed(false)} style={{background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.85)",padding:"7px 14px",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer"}}>🔒 잠금</button>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"16px 16px 80px"}}>
        {/* Actions */}
        <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>{setEditMember(null);setShowForm(true)}} style={{padding:"10px 18px",borderRadius:T.rs,border:"none",background:T.cardGold,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 10px rgba(201,162,39,.2)"}}>➕ 새 성도</button>
          <button onClick={()=>fileRef.current?.click()} style={{padding:"10px 18px",borderRadius:T.rs,border:`1px solid ${T.borderLight}`,background:T.cardBgFlat,fontSize:14,fontWeight:600,cursor:"pointer",color:T.text}}>📥 엑셀 업로드</button>
          <button onClick={()=>exportExcel(members)} style={{padding:"10px 18px",borderRadius:T.rs,border:"none",background:T.cardGreen,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:"0 2px 8px rgba(90,154,110,.2)"}}>📤 엑셀 다운로드</button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{display:"none"}} onChange={handleFile}/>
        </div>

        <div style={{padding:"12px 16px",borderRadius:T.rs,background:T.accentLight,marginBottom:16,fontSize:13,color:T.accent,lineHeight:1.7}}>
          💡 <strong>엑셀 양식:</strong> 첫 행에 <code style={{background:"rgba(201,162,39,.15)",padding:"1px 6px",borderRadius:4}}>이름 | 연락처 | 구역 | 메모</code> 열이 있으면 자동 인식
        </div>

        {/* Search + Filter */}
        <div style={{marginBottom:12}}><input type="text" placeholder="이름 또는 연락처 검색..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",padding:"12px 14px",borderRadius:T.rs,border:`2px solid ${T.borderLight}`,fontSize:15,background:T.cardBgFlat}}/></div>

        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {GROUPS.map(g=>(<button key={g} onClick={()=>setGroupFilter(g)} style={{padding:"8px 14px",borderRadius:10,border:"none",background:groupFilter===g?"linear-gradient(135deg,#d4b030,#c49520)":T.cardBgFlat,color:groupFilter===g?"#fff":T.text,fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:groupFilter===g?"0 2px 8px rgba(201,162,39,.2)":"none"}}>{g} ({groupCounts[g]||0})</button>))}
        </div>

        {/* Stats */}
        <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
          <div style={{padding:"14px 18px",borderRadius:T.rs,background:T.cardGold,flex:1,minWidth:130}}><div style={{fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>총 등록</div><div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{members.length}명</div></div>
          <div style={{padding:"14px 18px",borderRadius:T.rs,background:T.cardBgWarm,border:`1px solid ${T.borderLight}`,flex:1,minWidth:130}}><div style={{fontSize:10,color:T.green,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>연락처 등록</div><div style={{fontSize:24,fontWeight:800,color:T.green}}>{members.filter(m=>m.phone).length}명</div></div>
          <div style={{padding:"14px 18px",borderRadius:T.rs,background:T.cardBgWarm,border:`1px solid ${T.borderLight}`,flex:1,minWidth:130}}><div style={{fontSize:10,color:T.blue,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>검색 결과</div><div style={{fontSize:24,fontWeight:800,color:T.blue}}>{filtered.length}명</div></div>
        </div>

        {/* Member list */}
        {grouped.length===0?<div style={{padding:40,textAlign:"center",color:T.textSub,background:T.cardBgFlat,borderRadius:T.r}}>{search?`"${search}" 검색 결과 없음`:"등록된 성도가 없습니다"}</div>:
        grouped.map(([cho,mems])=>(<div key={cho} style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:800,color:T.accent,padding:"8px 4px",borderBottom:`2px solid ${T.accent}`,marginBottom:4,position:"sticky",top:56,background:T.pageBg,zIndex:5}}>{cho} ({mems.length})</div>
          {mems.map(m=>(<div key={m.id} className="hov" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:T.cardBg,borderRadius:T.rs,marginBottom:4,border:`1px solid ${T.borderLight}`,boxShadow:"0 1px 6px rgba(0,0,0,.02)"}}>
            <div style={{width:42,height:42,borderRadius:"50%",background:T.accentLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:800,color:T.accent,flexShrink:0}}>{m.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:16,fontWeight:700,color:T.text}}>{m.name}</span><span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:6,background:T.accentLight,color:T.accent}}>{m.group}</span></div>
              <div style={{fontSize:13,color:T.textSub,marginTop:2}}>{m.phone||"연락처 미등록"}{m.note&&<span style={{marginLeft:8,color:T.orange}}>📌 {m.note}</span>}</div>
            </div>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              <button onClick={()=>{setEditMember(m);setShowForm(true)}} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",padding:"8px 10px",borderRadius:8,fontSize:16,cursor:"pointer"}} title="수정">✏️</button>
              <button onClick={()=>setDeleteMember(m)} style={{background:"linear-gradient(135deg,#f0ece4,#e8e3da)",border:"none",padding:"8px 10px",borderRadius:8,fontSize:16,cursor:"pointer"}} title="삭제">🗑️</button>
            </div>
          </div>))}
        </div>))}
      </div>

      {showForm&&<FormModal member={editMember} onSave={handleSave} onClose={()=>{setShowForm(false);setEditMember(null)}}/>}
      {deleteMember&&<DeleteModal member={deleteMember} onConfirm={handleDelete} onClose={()=>setDeleteMember(null)}/>}
      {importPreview&&<ImportPreview members={importPreview} onConfirm={handleImport} onClose={()=>setImportPreview(null)}/>}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",padding:"14px 28px",borderRadius:12,background:toast.type==="red"?"linear-gradient(135deg,#d06060,#b84040)":T.cardGreen,color:"#fff",fontSize:15,fontWeight:700,boxShadow:"0 8px 30px rgba(0,0,0,.15)",zIndex:100,animation:"fadeUp .3s ease"}}>{toast.msg}</div>}
    </div>
  </>);
}
