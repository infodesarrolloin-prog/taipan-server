import{i as e}from"./rolldown-runtime-aKtaBQYM.js";import{Ct as t,H as n,M as r,P as i,U as a,Xt as o,Y as s,at as c,dt as l,it as u,wt as d,xt as f}from"./mui-DjnGLk-3.js";function p(e){return String(e).match(/[\d.\-+]*\s*(.*)/)[1]||``}function m(e){return parseFloat(e)}var h=e(o(),1);function g(e){return c(`MuiSkeleton`,e)}r(`MuiSkeleton`,[`root`,`text`,`rectangular`,`rounded`,`circular`,`pulse`,`wave`,`withChildren`,`fitContent`,`heightAuto`]);var _=f(),v=e=>{let{classes:t,variant:n,animation:r,hasChildren:i,width:a,height:o}=e;return u({root:[`root`,n,r,i&&`withChildren`,i&&!a&&`fitContent`,i&&!o&&`heightAuto`]},g,t)},y=d`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,b=d`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,x=typeof y==`string`?null:t`
        animation: ${y} 2s ease-in-out 0.5s infinite;
      `,S=typeof b==`string`?null:t`
        &::after {
          animation: ${b} 2s linear 0.5s infinite;
        }
      `,C=s(`span`,{name:`MuiSkeleton`,slot:`Root`,overridesResolver:(e,t)=>{let{ownerState:n}=e;return[t.root,t[n.variant],n.animation!==!1&&t[n.animation],n.hasChildren&&t.withChildren,n.hasChildren&&!n.width&&t.fitContent,n.hasChildren&&!n.height&&t.heightAuto]}})(a(({theme:e})=>{let t=p(e.shape.borderRadius)||`px`,n=m(e.shape.borderRadius),r=i(e,{animation:`none`}),a=i(e,{"&::after":{animation:`none`,display:`none`}});return{display:`block`,backgroundColor:e.vars?e.vars.palette.Skeleton.bg:e.alpha(e.palette.text.primary,e.palette.mode===`light`?.11:.13),height:`1.2em`,variants:[{props:{variant:`text`},style:{marginTop:0,marginBottom:0,height:`auto`,transformOrigin:`0 55%`,transform:`scale(1, 0.60)`,borderRadius:`${n}${t}/${Math.round(n/.6*10)/10}${t}`,"&:empty:before":{content:`"\\00a0"`}}},{props:{variant:`circular`},style:{borderRadius:`50%`}},{props:{variant:`rounded`},style:{borderRadius:(e.vars||e).shape.borderRadius}},{props:({ownerState:e})=>e.hasChildren,style:{"& > *":{visibility:`hidden`}}},{props:({ownerState:e})=>e.hasChildren&&!e.width,style:{maxWidth:`fit-content`}},{props:({ownerState:e})=>e.hasChildren&&!e.height,style:{height:`auto`}},{props:{animation:`pulse`},style:x||{animation:`${y} 2s ease-in-out 0.5s infinite`}},...r?[{props:{animation:`pulse`},style:r}]:[],{props:{animation:`wave`},style:{position:`relative`,overflow:`hidden`,WebkitMaskImage:`-webkit-radial-gradient(white, black)`,"&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(e.vars||e).palette.action.hover},
                transparent
              )`,content:`""`,position:`absolute`,transform:`translateX(-100%)`,bottom:0,left:0,right:0,top:0}}},{props:{animation:`wave`},style:S||{"&::after":{animation:`${b} 2s linear 0.5s infinite`}}},...a?[{props:{animation:`wave`},style:a}]:[]]}})),w=h.forwardRef(function(e,t){let r=n({props:e,name:`MuiSkeleton`}),{animation:i=`pulse`,className:a,component:o=`span`,height:s,style:c,variant:u=`text`,width:d,...f}=r,p={...r,animation:i,component:o,variant:u,hasChildren:!!f.children};return(0,_.jsx)(C,{as:o,ref:t,className:l(v(p).root,a),ownerState:p,...f,style:{width:d,height:s,...c}})});export{w as t};