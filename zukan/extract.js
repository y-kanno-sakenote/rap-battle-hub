// 4作の index.html から FIGHTERS（名前・肩書き）と PERSONA（人格）を抜いて zukan/data.json にする。図鑑の文はここから来るものだけ（新しい事実は書かない）
const fs=require('fs'), path=require('path');
const SITES=[['jozo','brew-rap-battle','醸造ラップバトル','https://jozorap.sakenote.net/'],['wine','wine-rap-battle','ワインラップバトル','https://y-kanno-sakenote.github.io/wine-rap-battle/'],['shochu','shochu-rap-battle','焼酎ラップバトル','https://y-kanno-sakenote.github.io/shochu-rap-battle/'],['chomiryo','chomiryo-rap-battle','調味料ラップバトル','https://y-kanno-sakenote.github.io/chomiryo-rap-battle/']];
const grab=(src,name)=>{ const i=src.search(new RegExp(`const ${name}\\s*=\\s*\\{`)); if(i<0) return null;
  let j=src.indexOf('{',i), d=0, k=j; for(;k<src.length;k++){ if(src[k]==='{')d++; else if(src[k]==='}'){d--; if(!d)break;} } return eval('('+src.slice(j,k+1)+')'); };
const arr=x=>Array.isArray(x)?x:(x?[x]:[]);
const out=[];
for(const [key,dir,title,url] of SITES){
  const src=fs.readFileSync(path.join(__dirname,'..','..',dir,'index.html'),'utf8');
  const F=grab(src,'FIGHTERS'), P=grab(src,'PERSONA')||{}, A=grab(src,'ABBR')||{};
  const un=s=>String(s??'').replace(/(^|[^A-Za-z])([A-Z]{2,3})(?![A-Za-z])/g,(m,p,a)=>A[a]?p+A[a]:m);
  out.push({key,title,url,chars:Object.entries(F).map(([id,f])=>{const p=P[id]||{}; return {id,name:f.name,emoji:f.emoji,desc:f.desc,
    pronoun:un(p.pronoun),tone:un(p.tone),pride:arr(p.pride).map(un),weakness:arr(p.weakness).map(un),signature:arr(p.signature),
    img:`img/${key}/${id}.png`, face:`img/${key}/faces/${id}.png`, pose:`img/${key}/pose/${id}.png`,
    pronounShort:un(p.pronoun).split(/[（(。、]/)[0].trim(), catch:[...(un(p.tone).match(/口癖((?:「[^」]+」)+)/)?.[1]||'').matchAll(/「([^」]+)」/g)].map(m=>m[1]).filter(t=>!t.startsWith('〜'))};})});
}
fs.writeFileSync(path.join(__dirname,'data.json'),JSON.stringify(out,null,1));
console.log(out.map(s=>s.key+':'+s.chars.length+' '+s.chars.map(c=>c.name+(c.pronoun?'○':'×')).join(' ')).join('\n'));
