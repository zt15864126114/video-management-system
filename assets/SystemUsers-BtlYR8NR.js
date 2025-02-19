import{_ as Z,r as s,p as ee,c as le,b as h,d as e,w as t,e as o,a0 as ae,a1 as te,f as y,k as oe,n as i,t as ne,g as k,O as ue,a2 as se,P as re,X as de,I as x,S as B}from"./index-DE67zCuG.js";const ie={class:"system-users"},me={class:"card-header"},pe={class:"header-left"},ce={class:"pagination-container"},ve={__name:"SystemUsers",setup(_e){const S=s(!1),v=s(""),b=s(""),U=s(1),C=s(10),T=s(100),$={admin:"danger",operator:"warning",user:"info"},z={admin:"管理员",operator:"操作员",user:"普通用户"},R=s([{id:1,username:"admin",realName:"管理员",role:"admin",department:["技术部","研发组"],email:"admin@example.com",status:1,lastLoginTime:"2024-01-20 12:00:00"}]),D=[{value:"技术部",label:"技术部",children:[{value:"研发组",label:"研发组"},{value:"测试组",label:"测试组"}]}],E=ee(()=>R.value.filter(n=>{const l=v.value?n.username.includes(v.value)||n.realName.includes(v.value):!0,p=b.value?n.role===b.value:!0;return l&&p})),m=s(!1),_=s("add"),w=s(null),u=s({username:"",realName:"",role:"",department:[],email:""}),F={username:[{required:!0,message:"请输入用户名",trigger:"blur"},{min:3,max:20,message:"长度在 3 到 20 个字符",trigger:"blur"}],realName:[{required:!0,message:"请输入姓名",trigger:"blur"}],role:[{required:!0,message:"请选择角色",trigger:"change"}],email:[{type:"email",message:"请输入正确的邮箱地址",trigger:"blur"}]},M=()=>{_.value="add",u.value={username:"",realName:"",role:"",department:[],email:""},m.value=!0},P=n=>{_.value="edit",u.value={...n},m.value=!0},q=n=>{B.confirm(`确定要删除用户 ${n.username} 吗？`,"警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{x.success("删除成功")})},I=n=>{B.confirm(`确定要重置用户 ${n.username} 的密码吗？`,"警告",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(()=>{x.success("密码重置成功")})},L=n=>{const l=n.status===1?"启用":"禁用";x.success(`用户${l}成功`)},O=async()=>{w.value&&await w.value.validate(n=>{n&&(x.success(_.value==="add"?"添加成功":"更新成功"),m.value=!1)})};return(n,l)=>{const p=o("el-input"),d=o("el-option"),N=o("el-select"),V=o("el-icon"),c=o("el-button"),r=o("el-table-column"),Q=o("el-tag"),j=o("el-switch"),A=o("el-button-group"),X=o("el-table"),G=o("el-pagination"),H=o("el-card"),f=o("el-form-item"),J=o("el-cascader"),K=o("el-form"),W=o("el-dialog"),Y=ae("loading");return h(),le("div",ie,[e(H,null,{header:t(()=>[y("div",me,[y("div",pe,[l[11]||(l[11]=y("span",{class:"title"},"用户管理",-1)),e(p,{modelValue:v.value,"onUpdate:modelValue":l[0]||(l[0]=a=>v.value=a),placeholder:"搜索用户名/姓名","prefix-icon":"Search",clearable:"",class:"search-input"},null,8,["modelValue"]),e(N,{modelValue:b.value,"onUpdate:modelValue":l[1]||(l[1]=a=>b.value=a),placeholder:"角色",clearable:""},{default:t(()=>[e(d,{label:"全部",value:""}),e(d,{label:"管理员",value:"admin"}),e(d,{label:"操作员",value:"operator"}),e(d,{label:"普通用户",value:"user"})]),_:1},8,["modelValue"])]),e(c,{type:"primary",onClick:M},{default:t(()=>[e(V,null,{default:t(()=>[e(k(de))]),_:1}),l[12]||(l[12]=i("新增用户 "))]),_:1})])]),default:t(()=>[te((h(),oe(X,{data:E.value,style:{width:"100%"}},{default:t(()=>[e(r,{prop:"username",label:"用户名",width:"120"}),e(r,{prop:"realName",label:"姓名",width:"120"}),e(r,{prop:"role",label:"角色",width:"100"},{default:t(({row:a})=>[e(Q,{type:$[a.role]},{default:t(()=>[i(ne(z[a.role]),1)]),_:2},1032,["type"])]),_:1}),e(r,{prop:"department",label:"部门",width:"150"}),e(r,{prop:"email",label:"邮箱"}),e(r,{prop:"status",label:"状态",width:"100"},{default:t(({row:a})=>[e(j,{modelValue:a.status,"onUpdate:modelValue":g=>a.status=g,"active-value":1,"inactive-value":0,onChange:g=>L(a)},null,8,["modelValue","onUpdate:modelValue","onChange"])]),_:1}),e(r,{prop:"lastLoginTime",label:"最后登录",width:"180"}),e(r,{label:"操作",width:"180",fixed:"right"},{default:t(({row:a})=>[e(A,null,{default:t(()=>[e(c,{type:"primary",link:"",onClick:g=>P(a)},{default:t(()=>[e(V,null,{default:t(()=>[e(k(ue))]),_:1}),l[13]||(l[13]=i("编辑 "))]),_:2},1032,["onClick"]),e(c,{type:"primary",link:"",onClick:g=>I(a)},{default:t(()=>[e(V,null,{default:t(()=>[e(k(se))]),_:1}),l[14]||(l[14]=i("重置密码 "))]),_:2},1032,["onClick"]),e(c,{type:"danger",link:"",onClick:g=>q(a)},{default:t(()=>[e(V,null,{default:t(()=>[e(k(re))]),_:1}),l[15]||(l[15]=i("删除 "))]),_:2},1032,["onClick"])]),_:2},1024)]),_:1})]),_:1},8,["data"])),[[Y,S.value]]),y("div",ce,[e(G,{"current-page":U.value,"onUpdate:currentPage":l[2]||(l[2]=a=>U.value=a),"page-size":C.value,"onUpdate:pageSize":l[3]||(l[3]=a=>C.value=a),"page-sizes":[10,20,50,100],total:T.value,layout:"total, sizes, prev, pager, next, jumper"},null,8,["current-page","page-size","total"])])]),_:1}),e(W,{title:_.value==="add"?"新增用户":"编辑用户",modelValue:m.value,"onUpdate:modelValue":l[10]||(l[10]=a=>m.value=a),width:"500px"},{footer:t(()=>[e(c,{onClick:l[9]||(l[9]=a=>m.value=!1)},{default:t(()=>l[16]||(l[16]=[i("取消")])),_:1}),e(c,{type:"primary",onClick:O},{default:t(()=>l[17]||(l[17]=[i("确定")])),_:1})]),default:t(()=>[e(K,{ref_key:"userFormRef",ref:w,model:u.value,rules:F,"label-width":"80px"},{default:t(()=>[e(f,{label:"用户名",prop:"username"},{default:t(()=>[e(p,{modelValue:u.value.username,"onUpdate:modelValue":l[4]||(l[4]=a=>u.value.username=a),disabled:_.value==="edit"},null,8,["modelValue","disabled"])]),_:1}),e(f,{label:"姓名",prop:"realName"},{default:t(()=>[e(p,{modelValue:u.value.realName,"onUpdate:modelValue":l[5]||(l[5]=a=>u.value.realName=a)},null,8,["modelValue"])]),_:1}),e(f,{label:"角色",prop:"role"},{default:t(()=>[e(N,{modelValue:u.value.role,"onUpdate:modelValue":l[6]||(l[6]=a=>u.value.role=a),placeholder:"请选择角色"},{default:t(()=>[e(d,{label:"管理员",value:"admin"}),e(d,{label:"操作员",value:"operator"}),e(d,{label:"普通用户",value:"user"})]),_:1},8,["modelValue"])]),_:1}),e(f,{label:"部门",prop:"department"},{default:t(()=>[e(J,{modelValue:u.value.department,"onUpdate:modelValue":l[7]||(l[7]=a=>u.value.department=a),options:D,placeholder:"请选择部门"},null,8,["modelValue"])]),_:1}),e(f,{label:"邮箱",prop:"email"},{default:t(()=>[e(p,{modelValue:u.value.email,"onUpdate:modelValue":l[8]||(l[8]=a=>u.value.email=a)},null,8,["modelValue"])]),_:1})]),_:1},8,["model"])]),_:1},8,["title","modelValue"])])}}},ge=Z(ve,[["__scopeId","data-v-cbf297f3"]]);export{ge as default};
