(function(){"use strict";const E="hack-for-impact-extension-root",v=['[data-testid*="terms"]','[class*="terms"]','[class*="consent"]','[class*="legal"]','[class*="agreement"]',"article","main","body"];let d=null,a={status:"idle"},u=null;chrome.runtime.onMessage.addListener(e=>{if(e.type==="TRIGGER_ANALYSIS"){A();return}if(e.type==="ANALYSIS_RESULT"){u=window.location.href,a={status:"success",data:e.data},x().render(a);return}e.type==="ANALYSIS_ERROR"&&(u=window.location.href,a={status:"error",message:e.message},x().render(a))});function A(){const e=x();if(e.open(),u===window.location.href&&a.status==="success"){e.render(a);return}if(u===window.location.href&&a.status==="loading"){e.render(a);return}a={status:"loading"},u=window.location.href,e.render(a);const t=N();if(!t){const n="No likely legal or financial text was found on this page.";a={status:"error",message:n},e.render(a),chrome.runtime.sendMessage({type:"ANALYSIS_ERROR",message:n});return}chrome.runtime.sendMessage({type:"ANALYZE_REQUEST",text:t,url:window.location.href})}function N(){for(const e of v){const t=Array.from(document.querySelectorAll(e));for(const n of t){const r=w(n.textContent??"");if(r.length>=200)return r.slice(0,8e3)}}return null}function w(e){return e.replace(/\s+/g," ").trim()}function x(){if(d)return d;const e=document.getElementById(E);if(e?.shadowRoot){const f=e.shadowRoot.getElementById("hack-for-impact-sidebar");if(f)return d=T(e,f),d}const t=document.createElement("div");t.id=E,document.body.appendChild(t);const n=t.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=S();const l=document.createElement("div");return l.id="hack-for-impact-sidebar",n.append(r,l),d=T(t,l),d}function T(e,t){const n={host:e,container:t,render:r=>L(t,r,n),open:()=>{e.style.display="block"},close:()=>{e.style.display="none"}};return n.render(a),n}function L(e,t,n){e.replaceChildren();const r=document.createElement("aside");r.className="panel";const l=document.createElement("div");l.className="header";const f=document.createElement("div");f.innerHTML=`
    <p class="eyebrow">Hack for Impact</p>
    <h2 class="title">Page Analysis</h2>
  `;const p=document.createElement("button");p.type="button",p.className="closeButton",p.setAttribute("aria-label","Close sidebar"),p.textContent="X",p.addEventListener("click",()=>n.close()),l.append(f,p),r.appendChild(l);const c=document.createElement("div");if(c.className="content",t.status==="loading"){const s=document.createElement("div");s.className="loadingCard",s.innerHTML=`
      <div class="spinner" aria-hidden="true"></div>
      <p class="loadingText">Analyzing...</p>
    `,c.appendChild(s)}if(t.status==="error"){const s=document.createElement("div");s.className="errorCard",s.innerHTML=`
      <p class="errorTitle">Analysis failed</p>
      <p class="errorMessage">${i(t.message)}</p>
    `,c.appendChild(s)}if(t.status==="success"){const s=document.createElement("div");s.className="riskCard",s.innerHTML=`
      <div>
        <p class="sectionLabel">Risk score</p>
        <p class="score">${t.data.riskScore}<span>/100</span></p>
      </div>
      <span class="riskBadge risk-${t.data.riskLevel}">${i(t.data.riskLevel)}</span>
    `,c.appendChild(s);const b=document.createElement("section");b.className="sectionCard",b.innerHTML=`
      <p class="sectionLabel">Plain Summary</p>
      <p class="summaryText">${i(h(t.data.summary,320))}</p>
    `,c.appendChild(b);const m=document.createElement("section");m.className="sectionCard";const y=document.createElement("p");y.className="sectionLabel",y.textContent="Top flagged clauses",m.appendChild(y);const g=document.createElement("div");g.className="clauses";const k=t.data.hiddenClauses.slice(0,3);if(k.length===0){const o=document.createElement("p");o.className="emptyText",o.textContent="No flagged clauses were returned for this page.",g.appendChild(o)}else for(const o of k){const C=document.createElement("article");C.className="clauseItem",C.innerHTML=`
          <div class="clauseHeader">
            <span class="clauseCategory">${i(o.category)}</span>
            <span class="severity severity-${o.severity}">${i(o.severity)}</span>
          </div>
          <p class="clauseExplanation">${i(h(o.explanation,160))}</p>
          <p class="clauseOriginal">${i(h(o.text,180))}</p>
        `,g.appendChild(C)}m.appendChild(g),c.appendChild(m)}r.appendChild(c),e.appendChild(r)}function h(e,t){const n=w(e);return n.length<=t?n:`${n.slice(0,t-1).trimEnd()}…`}function i(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")}function S(){return`
    :host {
      all: initial;
    }

    * {
      box-sizing: border-box;
    }

    .panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 380px;
      max-width: min(380px, 100vw);
      height: 100vh;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      background: linear-gradient(180deg, #fffdf8 0%, #f7efe2 100%);
      border-left: 1px solid #d7c1a2;
      box-shadow: -24px 0 48px rgba(55, 41, 19, 0.14);
      font-family: "Segoe UI", Arial, sans-serif;
      color: #2b2116;
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #eadac1;
      background: rgba(255, 252, 245, 0.92);
      backdrop-filter: blur(12px);
    }

    .eyebrow {
      margin: 0 0 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #8a5b21;
    }

    .title {
      margin: 0;
      font-size: 22px;
      line-height: 1.15;
      font-weight: 700;
    }

    .closeButton {
      border: 1px solid #d0b690;
      background: #fff8ed;
      color: #5a4122;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      flex: 0 0 auto;
    }

    .closeButton:hover {
      background: #f8ecd8;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .riskCard,
    .sectionCard,
    .loadingCard,
    .errorCard {
      border-radius: 18px;
      border: 1px solid #e4cfb0;
      background: rgba(255, 255, 255, 0.88);
      padding: 16px;
    }

    .riskCard {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .sectionLabel {
      margin: 0 0 8px;
      color: #7b5d35;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .score {
      margin: 0;
      font-size: 38px;
      line-height: 1;
      font-weight: 800;
    }

    .score span {
      font-size: 16px;
      color: #7b5d35;
      margin-left: 4px;
    }

    .riskBadge,
    .severity {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: capitalize;
    }

    .risk-low,
    .severity-low {
      background: #dff5df;
      color: #166534;
    }

    .risk-medium,
    .severity-medium {
      background: #fff2cc;
      color: #a16207;
    }

    .risk-high,
    .severity-high {
      background: #ffd9b8;
      color: #c2410c;
    }

    .risk-critical,
    .severity-critical {
      background: #ffe0e0;
      color: #b91c1c;
    }

    .summaryText,
    .clauseExplanation,
    .clauseOriginal,
    .emptyText,
    .errorMessage,
    .loadingText {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
    }

    .clauses {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .clauseItem {
      border-radius: 14px;
      padding: 14px;
      background: #fffaf1;
      border: 1px solid #eadcc6;
    }

    .clauseHeader {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .clauseCategory {
      font-size: 13px;
      font-weight: 700;
      color: #543b1c;
    }

    .clauseExplanation {
      color: #2f2418;
      margin-bottom: 8px;
    }

    .clauseOriginal {
      color: #73593a;
      font-size: 12px;
    }

    .loadingCard,
    .errorCard {
      display: flex;
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #ecdcc0;
      border-top-color: #8a5b21;
      animation: spin 0.8s linear infinite;
    }

    .errorTitle {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: #991b1b;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}})();
