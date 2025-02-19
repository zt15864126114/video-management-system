import{_ as ee,r as m,p as te,c as w,b as f,d as t,w as s,e as n,f as l,F as z,j as M,k as U,J as I,t as i,H as N,g as v,M as se,n as c,E as le,G as ae,Z as oe,i as ne,$ as ie,S as k,I as p}from"./index-DE67zCuG.js";import{V as de}from"./VideoPlayer-ChQcB6AA.js";const re={class:"alarm-management"},ce={class:"card-header"},ue={class:"header-actions"},me={class:"camera-wrapper"},pe=["data-camera-id"],_e={class:"camera-title"},fe={key:0,class:"camera-overlay"},ve={class:"alarm-content"},ge={class:"alarm-header"},ye={class:"alarm-info"},he={class:"alarm-time"},we={class:"alarm-actions"},Ce={class:"camera-tools"},ke={class:"tools-group"},xe={class:"statistics-row"},Ve={class:"card-header"},be={class:"trend-info"},Be={class:"card-header"},$e={class:"card-header"},Te={class:"card-header"},Ae={class:"alarm-records-container"},Ee={class:"alarm-record"},Se={class:"alarm-title"},De={class:"alarm-desc"},Fe={key:0,class:"alarm-actions"},Le={__name:"AlarmManagement",setup(ze){m([]);const $=m("all"),g=m(!1),T=m(null),C=m(""),u=m({method:"",description:""}),A=m([{id:1,name:"正门监控点",stream:"alarm-camera-1",status:"normal",recording:!1},{id:2,name:"后门监控点",stream:"alarm-camera-2",status:"alarm",recording:!1},{id:3,name:"操场监控点",stream:"alarm-camera-3",status:"normal",recording:!1},{id:4,name:"教学楼监控点",stream:"alarm-camera-4",status:"normal",recording:!1}]),d=m({todayAlarms:5,todayChange:-15,processing:2,processed:3}),x=m([{id:1,type:"入侵报警",location:"后门",time:"2024-03-20 14:30:00",description:"发现可疑人员尝试翻越围墙",status:"processing"},{id:2,type:"求助报警",location:"教学楼",time:"2024-03-20 14:25:00",description:"学生按下紧急求助按钮",status:"processed"}]),q=te(()=>C.value?A.value.filter(o=>o.name.toLowerCase().includes(C.value.toLowerCase())):A.value),P=()=>{k.confirm("确认发起紧急报警？","警告",{confirmButtonText:"确认",cancelButtonText:"取消",type:"warning"}).then(()=>{p.success("已发起紧急报警")})},R=()=>{k.prompt("请输入广播内容","广播通知",{confirmButtonText:"发送",cancelButtonText:"取消"}).then(({value:o})=>{p.success("广播发送成功")})},j=o=>{T.value=o,g.value=!0},G=()=>{if(!u.value.method||!u.value.description){p.warning("请填写完整的处理信息");return}console.log("处理报警:",T.value,u.value),p.success("报警处理成功"),g.value=!1,u.value={method:"",description:""}},E=(o,e)=>{e==="confirm"?k.confirm(`确认处理 ${o.name} 的报警吗？`,"警告",{confirmButtonText:"确认",cancelButtonText:"取消",type:"warning"}).then(()=>{o.status="normal",x.value.unshift({id:Date.now(),type:"异常报警",location:o.name,time:new Date().toLocaleString(),description:"异常行为报警，已确认处理",status:"processed"}),d.value.processing--,d.value.processed++,p.success("报警已处理")}):e==="ignore"&&k.confirm(`确认忽略 ${o.name} 的报警吗？`,"提示",{confirmButtonText:"确认",cancelButtonText:"取消",type:"info"}).then(()=>{o.status="normal",x.value.unshift({id:Date.now(),type:"异常报警",location:o.name,time:new Date().toLocaleString(),description:"异常行为报警，已忽略",status:"processed"}),d.value.processing--,d.value.processed++,p.info("报警已忽略")})},H=o=>{p.success(`已保存 ${o.name} 的截图`)},J=o=>{o.recording=!o.recording,p.success(`${o.recording?"开始":"停止"}录制 ${o.name} 的视频`)},Q=o=>{const e=document.querySelector(`[data-camera-id="${o.id}"] video`);e&&(document.fullscreenElement?document.exitFullscreen():e.requestFullscreen())};return(o,e)=>{const S=n("el-input"),r=n("el-button"),Z=n("el-button-group"),K=n("el-icon"),V=n("el-tooltip"),b=n("el-col"),D=n("el-row"),y=n("el-card"),B=n("el-tag"),_=n("el-option"),F=n("el-select"),O=n("el-timeline-item"),W=n("el-timeline"),L=n("el-form-item"),X=n("el-form"),Y=n("el-dialog");return f(),w("div",re,[t(D,{gutter:20},{default:s(()=>[t(b,{span:18},{default:s(()=>[t(y,null,{header:s(()=>[l("div",ce,[e[8]||(e[8]=l("span",null,"报警监控",-1)),l("div",ue,[t(S,{placeholder:"搜索监控点","prefix-icon":"Search",modelValue:C.value,"onUpdate:modelValue":e[0]||(e[0]=a=>C.value=a),style:{width:"200px","margin-right":"16px"}},null,8,["modelValue"]),t(Z,null,{default:s(()=>[t(r,{type:"danger",icon:v(ne),onClick:P},{default:s(()=>e[6]||(e[6]=[c(" 一键报警 ")])),_:1},8,["icon"]),t(r,{type:"warning",icon:v(ie),onClick:R},{default:s(()=>e[7]||(e[7]=[c(" 广播通知 ")])),_:1},8,["icon"])]),_:1})])])]),default:s(()=>[t(D,{gutter:16},{default:s(()=>[(f(!0),w(z,null,M(q.value,a=>(f(),U(b,{span:12,key:a.id},{default:s(()=>[l("div",me,[l("div",{class:"camera-container","data-camera-id":a.id},[l("div",_e,i(a.name),1),t(de,{stream:a.stream},null,8,["stream"]),l("div",{class:N(["camera-status",{"is-alarm":a.status==="alarm"}])},i(a.status==="normal"?"正常":"报警中"),3),a.status==="alarm"?(f(),w("div",fe,[l("div",ve,[l("div",ge,[t(K,{class:"alarm-icon"},{default:s(()=>[t(v(se))]),_:1}),e[9]||(e[9]=l("span",{class:"alarm-title"},"异常警报",-1))]),l("div",ye,[l("p",he,i(new Date().toLocaleTimeString()),1),e[10]||(e[10]=l("p",{class:"alarm-desc"},"检测到可疑行为，请及时处理",-1))]),l("div",we,[t(r,{type:"danger",size:"small",onClick:h=>E(a,"confirm")},{default:s(()=>e[11]||(e[11]=[c(" 确认警报 ")])),_:2},1032,["onClick"]),t(r,{type:"warning",size:"small",onClick:h=>E(a,"ignore")},{default:s(()=>e[12]||(e[12]=[c(" 忽略 ")])),_:2},1032,["onClick"])])])])):I("",!0),l("div",Ce,[l("div",ke,[t(V,{content:"截图"},{default:s(()=>[t(r,{icon:v(le),circle:"",onClick:h=>H(a)},null,8,["icon","onClick"])]),_:2},1024),t(V,{content:a.recording?"停止录制":"开始录制"},{default:s(()=>[t(r,{icon:v(ae),circle:"",type:a.recording?"danger":"default",onClick:h=>J(a)},null,8,["icon","type","onClick"])]),_:2},1032,["content"]),t(V,{content:"全屏"},{default:s(()=>[t(r,{icon:v(oe),circle:"",onClick:h=>Q(a)},null,8,["icon","onClick"])]),_:2},1024)])])],8,pe)])]),_:2},1024))),128))]),_:1})]),_:1}),l("div",xe,[t(y,{class:"statistic-card",shadow:"hover"},{header:s(()=>[l("div",Ve,[e[13]||(e[13]=l("span",null,"今日报警",-1)),t(B,{type:"danger",effect:"dark"},{default:s(()=>[c(i(d.value.todayAlarms),1)]),_:1})])]),default:s(()=>[l("div",be,[e[14]||(e[14]=l("span",{class:"trend-text"},"较昨日",-1)),l("span",{class:N(["trend-value",d.value.todayChange>0?"up":"down"])},i(d.value.todayChange>0?"+":"")+i(d.value.todayChange)+"% ",3)])]),_:1}),t(y,{class:"statistic-card",shadow:"hover"},{header:s(()=>[l("div",Be,[e[15]||(e[15]=l("span",null,"处理中",-1)),t(B,{type:"warning",effect:"dark"},{default:s(()=>[c(i(d.value.processing),1)]),_:1})])]),default:s(()=>[e[16]||(e[16]=l("div",{class:"trend-info"},[l("span",{class:"trend-text"},"平均处理时间"),l("span",{class:"trend-value"},"15分钟")],-1))]),_:1}),t(y,{class:"statistic-card",shadow:"hover"},{header:s(()=>[l("div",$e,[e[17]||(e[17]=l("span",null,"已处理",-1)),t(B,{type:"success",effect:"dark"},{default:s(()=>[c(i(d.value.processed),1)]),_:1})])]),default:s(()=>[e[18]||(e[18]=l("div",{class:"trend-info"},[l("span",{class:"trend-text"},"处理率"),l("span",{class:"trend-value success"},"98%")],-1))]),_:1})])]),_:1}),t(b,{span:6},{default:s(()=>[t(y,{class:"alarm-records-card"},{header:s(()=>[l("div",Te,[e[19]||(e[19]=l("span",null,"报警记录",-1)),t(F,{modelValue:$.value,"onUpdate:modelValue":e[1]||(e[1]=a=>$.value=a),placeholder:"类型",size:"small"},{default:s(()=>[t(_,{label:"全部",value:"all"}),t(_,{label:"入侵报警",value:"intrusion"}),t(_,{label:"火灾报警",value:"fire"}),t(_,{label:"求助报警",value:"help"})]),_:1},8,["modelValue"])])]),default:s(()=>[l("div",Ae,[t(W,null,{default:s(()=>[(f(!0),w(z,null,M(x.value,a=>(f(),U(O,{key:a.id,type:a.status==="processed"?"success":"danger",timestamp:a.time},{default:s(()=>[l("div",Ee,[l("div",Se,i(a.type)+" - "+i(a.location),1),l("div",De,i(a.description),1),a.status!=="processed"?(f(),w("div",Fe,[t(r,{type:"primary",size:"small",onClick:h=>j(a.id)},{default:s(()=>e[20]||(e[20]=[c(" 处理 ")])),_:2},1032,["onClick"])])):I("",!0)])]),_:2},1032,["type","timestamp"]))),128))]),_:1})])]),_:1})]),_:1})]),_:1}),t(Y,{modelValue:g.value,"onUpdate:modelValue":e[5]||(e[5]=a=>g.value=a),title:"报警处理",width:"500px"},{footer:s(()=>[t(r,{onClick:e[4]||(e[4]=a=>g.value=!1)},{default:s(()=>e[21]||(e[21]=[c("取消")])),_:1}),t(r,{type:"primary",onClick:G},{default:s(()=>e[22]||(e[22]=[c("确认")])),_:1})]),default:s(()=>[t(X,{model:u.value,"label-width":"100px"},{default:s(()=>[t(L,{label:"处理方式"},{default:s(()=>[t(F,{modelValue:u.value.method,"onUpdate:modelValue":e[2]||(e[2]=a=>u.value.method=a),placeholder:"请选择处理方式"},{default:s(()=>[t(_,{label:"现场处理",value:"onsite"}),t(_,{label:"远程处理",value:"remote"}),t(_,{label:"转交处理",value:"transfer"})]),_:1},8,["modelValue"])]),_:1}),t(L,{label:"处理说明"},{default:s(()=>[t(S,{type:"textarea",modelValue:u.value.description,"onUpdate:modelValue":e[3]||(e[3]=a=>u.value.description=a),rows:"4"},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["modelValue"])])}}},Ie=ee(Le,[["__scopeId","data-v-59dcc197"]]);export{Ie as default};
