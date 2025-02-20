import{_ as W,r,m as q,o as J,a as O,c as d,b as n,e as t,d as s,F as _,g as m,w as a,f as i,k as H,i as j,j as Q,G as g,t as o,n as X,l as u,h as w,H as Y,C as Z,I as ee,E as B}from"./index-vINHRGGD.js";import{V as te}from"./VideoPlayer-Cy_EvSJ9.js";const se={class:"vehicle-monitor"},ae={class:"statistics-row"},le={class:"stat-info"},oe={class:"stat-value"},ne={class:"stat-label"},ie={class:"card-header"},de={class:"header-left"},ce={class:"video-container"},re={class:"video-player"},ue={key:0,class:"analysis-overlay"},pe={class:"detection-info"},_e={class:"analysis-panel"},me={class:"panel-header"},ve={class:"analysis-content"},he={class:"result-info"},ye={class:"plate-number"},fe={class:"detail-info"},be={class:"card-header"},ge={class:"records-list"},we={class:"record-header"},Ve={class:"plate-number"},xe={class:"record-details"},ke={class:"record-info"},Ne={class:"record-time"},Me={key:0,class:"violation-info"},Ce={class:"record-image"},ze={__name:"VehicleMonitor",setup(De){const S=r([{label:"今日通行",value:"1,245",icon:"Van",type:"primary",trend:15},{label:"实时车流",value:"86",icon:"DataLine",type:"success",trend:8},{label:"违规记录",value:"12",icon:"Warning",type:"danger",trend:-5}]),I=r([{id:1,name:"东门入口"},{id:2,name:"南门入口"},{id:3,name:"西门入口"},{id:4,name:"北门入口"},{id:5,name:"地下车库入口"}]),V=r(1),p=r(!1),x=r(!0),y=r([{id:1,plateNumber:"鲁H8A7B6",status:"已登记",type:"success",style:{left:"120px",top:"150px",width:"180px",height:"100px"}},{id:2,plateNumber:"鲁H2S8K9",status:"已登记",type:"success",style:{left:"350px",top:"200px",width:"160px",height:"90px"}}]),v=r([{id:1,plateNumber:"鲁H8A7B6",snapshot:"path/to/snapshot1.jpg",time:"10:30:45",status:"正常通行",type:"success"},{id:2,plateNumber:"鲁H2S8K9",snapshot:"path/to/snapshot2.jpg",time:"10:29:30",status:"正常通行",type:"success"}]),k=r([{id:1,plateNumber:"鲁H8A7B6",type:"normal",location:"东门入口",time:"10:30:45",snapshot:"path/to/snapshot1.jpg"},{id:2,plateNumber:"鲁H1D8F3",type:"violation",location:"南门入口",time:"10:28:15",violation:"未登记车辆",snapshot:"path/to/snapshot2.jpg"}]),f=r("all"),A=q(()=>f.value==="all"?k.value:k.value.filter(c=>c.type==="violation")),T=()=>{p.value=!p.value,B.success(p.value?"开始视频分析":"停止视频分析")},U=()=>{B.success("抓拍成功")};let b=null;return J(()=>{b=setInterval(()=>{if(p.value&&(y.value=y.value.map(c=>({...c,style:{...c.style,left:`${parseInt(c.style.left)+Math.random()*10-5}px`,top:`${parseInt(c.style.top)+Math.random()*10-5}px`}})),Math.random()>.8)){const c={id:Date.now(),plateNumber:`鲁H${Math.random().toString(36).substr(2,4).toUpperCase()}`,snapshot:"path/to/new-snapshot.jpg",time:new Date().toLocaleTimeString(),status:Math.random()>.9?"未登记":"正常通行",type:Math.random()>.9?"danger":"success"};v.value.unshift(c),v.value.length>10&&v.value.pop()}},1e3)}),O(()=>{b&&clearInterval(b)}),(c,l)=>{const N=i("el-icon"),E=i("el-option"),F=i("el-select"),h=i("el-tag"),M=i("el-button"),L=i("el-button-group"),R=i("el-switch"),$=i("el-avatar"),C=i("el-card"),z=i("el-col"),D=i("el-radio-button"),K=i("el-radio-group"),P=i("el-image"),G=i("el-row");return n(),d("div",se,[t("div",ae,[(n(!0),d(_,null,m(S.value,e=>(n(),d("div",{key:e.label,class:"stat-card"},[t("div",{class:H(["stat-icon",e.type])},[s(N,null,{default:a(()=>[(n(),j(Q(e.icon)))]),_:2},1024)],2),t("div",le,[t("div",oe,o(e.value),1),t("div",ne,o(e.label),1),e.trend?(n(),d("div",{key:0,class:H(["stat-trend",e.trend>0?"up":"down"])},o(Math.abs(e.trend))+"% "+o(e.trend>0?"↑":"↓"),3)):g("",!0)])]))),128))]),s(G,{gutter:20},{default:a(()=>[s(z,{span:16},{default:a(()=>[s(C,{class:"monitor-card"},{header:a(()=>[t("div",ie,[t("div",de,[s(F,{modelValue:V.value,"onUpdate:modelValue":l[0]||(l[0]=e=>V.value=e),placeholder:"选择监控点",class:"camera-select"},{default:a(()=>[(n(!0),d(_,null,m(I.value,e=>(n(),j(E,{key:e.id,label:e.name,value:e.id},null,8,["label","value"]))),128))]),_:1},8,["modelValue"]),s(h,{type:p.value?"success":"info",class:"analysis-status"},{default:a(()=>[u(o(p.value?"分析中":"未分析"),1)]),_:1},8,["type"])]),s(L,null,{default:a(()=>[s(M,{type:"primary",icon:w(Y),onClick:T},{default:a(()=>[u(o(p.value?"停止分析":"开始分析"),1)]),_:1},8,["icon"]),s(M,{type:"warning",icon:w(Z),onClick:U},{default:a(()=>l[3]||(l[3]=[u("抓拍")])),_:1},8,["icon"])]),_:1})])]),default:a(()=>[t("div",ce,[t("div",re,[s(te,{ref:"videoPlayer",class:"video-content"},null,512),p.value?(n(),d("div",ue,[(n(!0),d(_,null,m(y.value,e=>(n(),d("div",{key:e.id,class:"detection-box",style:X(e.style)},[t("div",pe,[u(o(e.plateNumber)+" ",1),s(h,{size:"small",type:e.type},{default:a(()=>[u(o(e.status),1)]),_:2},1032,["type"])])],4))),128))])):g("",!0)]),t("div",_e,[t("div",me,[l[4]||(l[4]=t("span",null,"实时分析结果",-1)),s(R,{modelValue:x.value,"onUpdate:modelValue":l[1]||(l[1]=e=>x.value=e),"active-text":"显示轨迹"},null,8,["modelValue"])]),t("div",ve,[(n(!0),d(_,null,m(v.value,e=>(n(),d("div",{key:e.id,class:"analysis-item"},[s($,{size:40,src:e.snapshot},null,8,["src"]),t("div",he,[t("div",ye,o(e.plateNumber),1),t("div",fe,[t("span",null,o(e.time),1),s(h,{size:"small",type:e.type},{default:a(()=>[u(o(e.status),1)]),_:2},1032,["type"])])])]))),128))])])])]),_:1})]),_:1}),s(z,{span:8},{default:a(()=>[s(C,{class:"record-card"},{header:a(()=>[t("div",be,[l[7]||(l[7]=t("span",null,"通行记录",-1)),s(K,{modelValue:f.value,"onUpdate:modelValue":l[2]||(l[2]=e=>f.value=e),size:"small"},{default:a(()=>[s(D,{label:"all"},{default:a(()=>l[5]||(l[5]=[u("全部")])),_:1}),s(D,{label:"violation"},{default:a(()=>l[6]||(l[6]=[u("违规")])),_:1})]),_:1},8,["modelValue"])])]),default:a(()=>[t("div",ge,[(n(!0),d(_,null,m(A.value,e=>(n(),d("div",{key:e.id,class:"record-item"},[t("div",we,[t("span",Ve,o(e.plateNumber),1),s(h,{size:"small",type:e.type==="normal"?"success":"danger"},{default:a(()=>[u(o(e.type==="normal"?"正常":"违规"),1)]),_:2},1032,["type"])]),t("div",xe,[t("div",ke,[t("span",null,o(e.location),1),t("span",Ne,o(e.time),1)]),e.violation?(n(),d("div",Me,[s(N,null,{default:a(()=>[s(w(ee))]),_:1}),t("span",null,o(e.violation),1)])):g("",!0)]),t("div",Ce,[s(P,{src:e.snapshot,"preview-src-list":[e.snapshot],fit:"cover"},null,8,["src","preview-src-list"])])]))),128))])]),_:1})]),_:1})]),_:1})])}}},Be=W(ze,[["__scopeId","data-v-a3b58a75"]]);export{Be as default};
