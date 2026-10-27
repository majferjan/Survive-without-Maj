const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let created=0;
class Element {
 constructor(){created++;this.children=[];this.attributes={};this.dataset={};this.className='';this.textContent='';this.disabled=false;this.open=false;}
 append(...items){this.children.push(...items);}
 setAttribute(k,v){this.attributes[k]=v;} getAttribute(k){return this.attributes[k];}
 querySelectorAll(){return this.children.flatMap(row=>row.children);}
 showModal(){this.open=true;} close(){this.open=false;}
}
const ids=Object.fromEntries(['message','board','keyboard','retry','helpButton','closeHelp','help','closeGame'].map(id=>[id,new Element()]));
const saved=new Map();
const context=vm.createContext({progressSessionCurrent:()=>true,refreshAfterProgressReset(){},URLSearchParams,location:{search:'?mission=1',origin:'http://localhost'},parent:{postMessage(){}},document:{getElementById:id=>ids[id],createElement:()=>new Element(),addEventListener(){}},localStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)}});
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

const resetContext=vm.createContext({});
vm.runInContext(fs.readFileSync('reset-progress.js','utf8'),resetContext);
const entries=new Map([['custom-challenges-test','[1]'],['wordle-test-1-example','[]'],['unrelated','keep'],['custom-challenges-other','keep']]);
const mock={get length(){return entries.size},key:i=>[...entries.keys()][i],removeItem:key=>entries.delete(key),setItem:(key,value)=>entries.set(key,value)};
assert.equal(resetContext.resetChallengeProgress(mock,'test'),2);
assert.equal(entries.get('unrelated'),'keep');
assert.equal(entries.get('custom-challenges-other'),'keep');
console.log('PASS: reset only removes current puzzle-set progress.');

// Model an open game tab and a reset in another tab without real browser data.
let reloads=0;const listeners={};
const sessionContext=vm.createContext({CHALLENGE_SETTINGS:{version:'test'},localStorage:{getItem:k=>entries.get(k)||null},window:{addEventListener:(name,fn)=>listeners[name]=fn},document:{hidden:false,addEventListener:(name,fn)=>listeners[name]=fn},location:{reload:()=>reloads++}});
vm.runInContext(fs.readFileSync('progress-session.js','utf8'),sessionContext);
assert.equal(sessionContext.progressSessionCurrent(),true);
entries.set('custom-challenges-test','[1]');entries.set('wordle-test-1-example','["example"]');
resetContext.resetChallengeProgress(mock,'test');
assert.equal(sessionContext.progressSessionCurrent(),false);
assert.equal(entries.has('custom-challenges-test'),false);
assert.equal(entries.has('wordle-test-1-example'),false);
listeners.storage({key:'challenge-reset-test'});listeners.pageshow();listeners.visibilitychange();
assert.equal(reloads,3);
console.log('PASS: reset invalidates stale sessions and refreshes open/restored tabs.');

// Exercise the text form without changing any real puzzle or progress.
Element.prototype.focus=function(){};
vm.runInContext(fs.readFileSync('text-challenge.js','utf8'),context);
const textContainer=new Element();let textWins=0;
context.renderTextChallenge(textContainer,{message:'<b>Plain clue</b>',answer:'Hello there'},()=>textWins++);
assert.equal(textContainer.children[0].textContent,'<b>Plain clue</b>');
const form=textContainer.children[1],field=form.children[1].children[0],feedback=form.children[2];
field.value='wrong';form.onsubmit({preventDefault(){}});assert.equal(textWins,0);assert.equal(feedback.textContent,'Not quite. Try again.');
field.value='  HELLO   there ';form.onsubmit({preventDefault(){}});assert.equal(textWins,1);
form.onsubmit({preventDefault(){}});assert.equal(textWins,1);
console.log('PASS: text challenge prompt, incorrect/correct submissions, and duplicate-submit prevention.');
