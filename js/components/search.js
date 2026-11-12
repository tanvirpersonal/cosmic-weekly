import {h} from "../core/dom.js";
import {searchArticles} from "../core/data.js";
import {url,PATHS} from "../config.js";
export function mountSearch(articles){
 const box=h("div",{class:"search","aria-hidden":"true"});
 const input=h("input",{class:"search__input",type:"search",placeholder:"Search stories…","aria-label":"Search stories"});
 const results=h("ul",{class:"search__results"});
 const close=()=>{box.classList.remove("is-open");box.setAttribute("aria-hidden","true");};
 box.append(h("div",{class:"search__panel"},h("div",{class:"search__bar"},input,h("button",{class:"icon-btn","aria-label":"Close search",onclick:close},"×")),results));
 document.body.append(box);
 const render=()=>{const hits=searchArticles(articles,input.value).slice(0,8);results.replaceChildren(...hits.map(a=>h("li",{class:"search__item"},h("a",{href:url(PATHS.articlePage(a.slug))},a.title))));};
 input.addEventListener("input",render);
 document.addEventListener("cw:search-open",()=>{box.classList.add("is-open");box.setAttribute("aria-hidden","false");input.focus();});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")close();if(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();box.classList.add("is-open");input.focus();}});
}