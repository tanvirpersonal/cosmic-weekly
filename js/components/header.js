import {h,icon,ICONS} from "../core/dom.js";
import {url} from "../config.js";
import {toggleTheme} from "../core/theme.js";
export function mountHeader(site){
 const host=document.querySelector("[data-header]");if(!host)return;
 const brand=h("a",{class:"brand",href:url("")},h("span",{class:"brand__mark"},"✦"),h("span",{class:"brand__name"},site.name));
 const nav=h("nav",{class:"site-nav","aria-label":"Main navigation"},...site.nav.map(n=>h("a",{href:url(n.path)},n.label)));
 const menu=h("button",{class:"icon-btn",id:"menu-toggle",type:"button","aria-label":"Toggle navigation",onclick:()=>{const open=nav.dataset.open==="1";nav.dataset.open=open?"0":"1";nav.style.cssText=open?"":"display:flex;position:absolute;top:var(--header-h);left:0;right:0;padding:1rem;flex-direction:column;align-items:stretch;background:var(--bg-elev);border-bottom:1px solid var(--line);";}},icon(ICONS.menu));
 const actions=h("div",{class:"site-header__actions"},h("button",{class:"icon-btn",type:"button","aria-label":"Search",onclick:()=>document.dispatchEvent(new Event("cw:search-open"))},icon(ICONS.search)),h("button",{class:"icon-btn",type:"button","aria-label":"Toggle theme",onclick:()=>toggleTheme()},icon(ICONS.sun)),menu);
 host.replaceChildren(h("div",{class:"container site-header__inner"},brand,nav,actions));
}