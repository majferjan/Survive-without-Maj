const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let created=0;
class Element {
 constructor(){created++;this.children=[];this.attributes={};this.dataset={};this.className='';this.textContent='';this.disabled=false;this.open=false;}
 append(...items){this.children.push(...items);}
 setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k];}
 querySelectorAll(){return this.children.flatMap(row=>row.children);}
 showModal(){this.open=true;} close(){this.open=false;}
}
const ids=Object.fromEntries(['message','board','keyboard','retry','helpButton','closeHelp','help'].map(id=>[id,new Element()]));
const saved=new Map();
const context=vm.createContext({URLSearchParams,location:{search:'?mission=1',origin:'http://localhost'},parent:{postMessage(){}},document:{getElementById:id=>ids[id],createElement:()=>new Element(),addEventListener(){}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)}});
vm.runInContext("const CHALLENGE_SETTINGS={version:'test'};const CHALLENGES=[{id:1,type:'wordle',word:'apple'}];const VALID_WORDS=new Set(['crane']);",context);
vm.runInContext(fs.readFileSync('puzzle-core.js','utf8')+fs.readFileSync('wordle.js','utf8'),context);
const before=created,first=ids.board.children[0].children[0];
vm.runInContext("for(const letter of 'crane') handle(letter); handle('Enter');",context);
assert.equal(created,before,'Typing must allocate no new DOM nodes');
assert.equal(ids.board.children[0].children[0],first,'Tile identity must survive redraw');
assert.equal(first.textContent,'c');
assert.equal([...saved.values()][0],'["crane"]');
vm.runInContext("handle('a');handle('Backspace');",context);
assert.equal(created,before);
console.log('PASS: persistent Wordle tiles, zero DOM allocation on typing, scoring redraw, and saved guesses.');
