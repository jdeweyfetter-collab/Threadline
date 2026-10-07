'use client';
import {useState} from 'react';
import {Check,ChevronDown,Plus} from 'lucide-react';
import {categoryOptions,normalizeCategory,type GarmentMetadata} from '@/lib/closet';

const colorBases=['Black','White','Gray','Brown','Beige','Red','Orange','Yellow','Green','Blue','Purple','Pink','Multicolor'];
const colorShades:Record<string,string[]>={
 Black:['Jet','Charcoal'],White:['Ivory','Cream'],Gray:['Silver','Slate','Charcoal'],Brown:['Chocolate','Camel','Tan'],Beige:['Sand','Taupe','Cream'],
 Red:['Burgundy','Wine','Brick'],Orange:['Rust','Terracotta','Copper'],Yellow:['Mustard','Gold'],Green:['Olive','Sage','Forest'],
 Blue:['Navy','Cobalt','Royal','Sky','Slate','Denim','Teal-blue'],Purple:['Lavender','Plum','Lilac'],Pink:['Blush','Rose','Fuchsia'],Multicolor:[],
};
const shadeBase=Object.fromEntries(Object.entries(colorShades).flatMap(([base,shades])=>shades.map(shade=>[shade,base]))) as Record<string,string>;
const allColorNames=[...new Set([...colorBases,...Object.values(colorShades).flat()])];
const colorHex:Record<string,string>={Black:'#292b28',White:'#faf9f5',Gray:'#9a9c96',Brown:'#8d6246',Beige:'#d4c6ac',Red:'#b94d49',Orange:'#d79959',Yellow:'#ded184',Green:'#56755b',Blue:'#6d93be',Purple:'#9e81ac',Pink:'#deb1ba',Multicolor:'linear-gradient(135deg,#de7770 0 25%,#e2cc68 25% 50%,#719e77 50% 75%,#7796bd 75%)',Navy:'#2e3d58',Cobalt:'#2855bd',Royal:'#4169e1',Sky:'#87ceeb',Slate:'#708090',Denim:'#426b8c','Teal-blue':'#367c82',Olive:'#81815a',Sage:'#a3b18a',Forest:'#315b43',Ivory:'#fffff0',Cream:'#f2e8cf',Sand:'#c2a878',Taupe:'#8b8589',Chocolate:'#7b4b32',Camel:'#c19a6b',Tan:'#d2b48c',Burgundy:'#800020',Wine:'#722f37',Brick:'#a34a3c',Rust:'#b7410e',Terracotta:'#e2725b',Copper:'#b87333',Mustard:'#d4a017',Gold:'#d4af37',Silver:'#c0c0c0',Charcoal:'#36454f',Jet:'#343434',Lavender:'#e6e6fa',Plum:'#8e4585',Lilac:'#c8a2c8',Blush:'#de5d83',Rose:'#ff007f',Fuchsia:'#ff00ff'};

function MultiChoices({label,values,options,onChange}:{label:string;values:string[];options:string[];onChange:(v:string[])=>void}){
 const [custom,setCustom]=useState('');const all=[...new Set([...values,...options])];
 function add(){const next=custom.trim();if(next){onChange([...new Set([...values,...next.split(',').map(v=>v.trim()).filter(Boolean)])]);setCustom('')}}
 return <fieldset className="tl-tags"><legend>{label}</legend><div className="tl-chip-wrap">{all.map(value=><button type="button" key={value} aria-pressed={values.includes(value)} onClick={()=>onChange(values.includes(value)?values.filter(v=>v!==value):[...values,value])}>{value}{values.includes(value)&&<Check size={13}/>}</button>)}</div><div className="tl-custom-tag"><input aria-label={`Custom ${label.toLowerCase()}`} placeholder={`Add ${label.toLowerCase()}`} value={custom} onChange={e=>setCustom(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}}/><button type="button" aria-label={`Add custom ${label.toLowerCase()}`} disabled={!custom.trim()} onClick={add}><Plus size={20}/></button></div></fieldset>
}

function SingleChoice({label,value,options,onChange,customLabel='Custom…',placeholder='Add a custom value'}:{label:string;value:string;options:string[];onChange:(v:string)=>void;customLabel?:string;placeholder?:string}){
 const [customOpen,setCustomOpen]=useState(false);const isCustom=!!value&&!options.includes(value);const showCustom=customOpen||isCustom;
 return <fieldset className="tl-tags"><legend>{label}</legend><div className="tl-chip-wrap">{options.map(option=><button type="button" key={option} aria-pressed={value===option} onClick={()=>{setCustomOpen(false);onChange(option)}}>{option}{value===option&&<Check size={13}/>}</button>)}<button type="button" aria-pressed={showCustom} onClick={()=>{if(!showCustom&&value&&options.includes(value))onChange('');setCustomOpen(true)}}>{customLabel}{isCustom&&<>: {value}<Check size={13}/></>}</button></div>{showCustom&&<label className="tl-field tl-inline-custom"><span>{customLabel.replace('…','')}</span><input value={isCustom?value:''} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>}</fieldset>
}

export function CategoryChoices({value,onChange,onSelect}:{value:string;onChange:(v:string)=>void;onSelect?:(v:string)=>void}){
 const matched=categoryOptions.find(option=>normalizeCategory(option.value)===normalizeCategory(value));const custom=!!value&&!matched;
 return <fieldset className="tl-tags"><legend>Category</legend><div className="tl-chip-wrap">{categoryOptions.map(option=>{const selected=matched?.value===option.value||(!matched&&option.value==='Other');return <button type="button" key={option.value} aria-pressed={selected} onClick={()=>{onChange(option.value);if(option.value!=='Other')onSelect?.(option.value)}}>{option.label}{selected&&<Check size={13}/>}</button>})}</div>{(value==='Other'||custom)&&<label className="tl-field tl-inline-custom"><span>Name this category</span><input value={custom?value:''} placeholder="Add a category" onChange={e=>onChange(e.target.value||'Other')}/></label>}</fieldset>
}

function ColorChoices({values,onChange}:{values:string[];onChange:(v:string[])=>void}){
 const primary=values[0]||'';const additional=values.slice(1);const primaryBase=shadeBase[primary]||primary;const isNamedColor=allColorNames.includes(primary);const [customOpen,setCustomOpen]=useState(false);const [shadesOpen,setShadesOpen]=useState(false);const [additionalOpen,setAdditionalOpen]=useState(additional.length>0);
 function setPrimary(next:string){const rest=values.filter(value=>value!==primary&&value!==next);if(primary&&primary!==next)rest.unshift(primary);onChange(next?[next,...rest]:rest)}
 function setAdditional(next:string[]){onChange([...(primary?[primary]:[]),...next.filter(value=>value!==primary)])}
 return <fieldset className="tl-tags"><legend>Colors</legend><p className="tl-hint">Choose a primary color. Add any other colors below.</p><div className="tl-chip-wrap">{colorBases.map(color=><button type="button" key={color} aria-pressed={primaryBase===color} onClick={()=>{setCustomOpen(false);setPrimary(color)}}><i style={{background:colorHex[color]||'#ddd'}}/>{color}{primaryBase===color&&<Check size={13}/>}</button>)}<button type="button" aria-pressed={customOpen||(!isNamedColor&&!!primary)} onClick={()=>{if(!customOpen&&!isNamedColor)setPrimary('');setCustomOpen(true)}}>Custom…{!isNamedColor&&primary&&<>: {primary}<Check size={13}/></>}</button></div>{(customOpen||!!primary&&!isNamedColor)&&<label className="tl-field tl-inline-custom"><span>Custom primary color</span><input value={isNamedColor?'':primary} placeholder="Describe the main color" onChange={e=>setPrimary(e.target.value)}/></label>}
 {!!(colorShades[primaryBase]?.length)&&<details className="tl-choice-disclosure" open={shadesOpen} onToggle={e=>setShadesOpen(e.currentTarget.open)}><summary>Choose a specific {primaryBase.toLowerCase()} shade<ChevronDown size={16}/></summary><div className="tl-chip-wrap">{colorShades[primaryBase].map(shade=><button type="button" key={shade} aria-pressed={primary===shade} onClick={()=>setPrimary(shade)}>{shade}{primary===shade&&<Check size={13}/>}</button>)}</div></details>}
 {!!primary&&<details className="tl-choice-disclosure" open={additionalOpen} onToggle={e=>setAdditionalOpen(e.currentTarget.open)}><summary>Additional colors{additional.length?` · ${additional.length}`:''}<ChevronDown size={16}/></summary><MultiChoices label="Additional colors" values={additional} options={allColorNames.filter(v=>v!==primary)} onChange={setAdditional}/></details>}</fieldset>
}

const subcategories:Record<string,string[]>={
 Tops:['T-shirt','Button-down','Polo','Sweater','Hoodie','Tank','Blouse'],
 Bottoms:['Jeans','Trousers','Chinos','Shorts','Skirt','Leggings'],
 'Jackets / Outerwear':['Jacket','Coat','Blazer','Vest','Overshirt'],Shoes:['Sneakers','Boots','Loafers','Sandals','Heels','Flats'],
 Dresses:['Dress','Jumpsuit','Romper'],Accessories:['Bag','Belt','Hat','Scarf','Jewelry','Sunglasses'],Activewear:['Sports bra','Leggings','Performance top','Shorts','Track pants'],
};
const fitOptions:Record<string,string[]>={
 Tops:['Slim','Regular','Relaxed','Oversized','Cropped'],Bottoms:['Slim','Regular','Relaxed','Tapered','Straight','Wide-leg','Cropped'],
 'Jackets / Outerwear':['Slim','Regular','Relaxed','Oversized','Cropped'],Shoes:['Narrow','Regular','Wide'],Dresses:['Slim','Regular','Relaxed','Oversized','Cropped'],
 Accessories:['Slim','Regular','Oversized'],Activewear:['Slim','Regular','Relaxed','Compression'],
};
const patterns=['Solid','Striped','Plaid','Check','Floral','Graphic','Herringbone','Paisley','Polka dot','Colorblock','Animal print'];
const eras=['Contemporary','2020s','2010s','2000s','1990s','1980s','1970s','1960s','1950s','Pre-1950','Unknown'];
const materials=['Cotton','Polyester','Wool','Linen','Silk','Rayon / Viscose','Nylon','Acrylic','Leather','Suede','Denim','Elastane / Spandex'];

export function MetadataFields({draft,onChange,showCategory=false}:{draft:GarmentMetadata;onChange:(d:GarmentMetadata)=>void;showCategory?:boolean}){
 const set=(key:keyof GarmentMetadata,value:any)=>onChange({...draft,[key]:value});
 const field=(key:keyof GarmentMetadata,label:string,type='text',placeholder='')=><label className="tl-field" key={key}><span>{label}</span><input type={type} placeholder={placeholder} min={type==='number'?'0':undefined} step={type==='number'?'.01':undefined} inputMode={type==='number'?'decimal':undefined} value={draft[key] as string??''} onInput={e=>{if(type==='date')set(key,e.currentTarget.value)}} onChange={e=>set(key,type==='number'?(e.target.value===''?null:Number(e.target.value)):e.target.value)}/></label>;
 const colors=(values:string[])=>set('colors',values);const currentCategory=normalizeCategory(draft.category);
 return <div className="tl-metadata">{field('name','Name','text','Give it a name, or leave it blank')}
 {showCategory&&<CategoryChoices value={draft.category} onChange={value=>set('category',value)}/>}
 <details open><summary>About this garment<ChevronDown size={17}/></summary><div className="tl-fields"><SingleChoice label="Subcategory" value={draft.subcategory} options={subcategories[currentCategory]||[]} onChange={value=>set('subcategory',value)} placeholder="Name a subcategory"/>{field('brand','Brand')}{field('size','Size')}{field('condition','Condition','text','e.g. New, good, well loved')}</div></details>
 <details><summary>Colors & pattern<ChevronDown size={17}/></summary><ColorChoices values={draft.colors} onChange={colors}/><SingleChoice label="Pattern" value={draft.pattern} options={patterns} onChange={value=>set('pattern',value)} placeholder="Describe the pattern"/></details>
 <details><summary>Materials & fit<ChevronDown size={17}/></summary><MultiChoices label="Materials" values={draft.materials} options={materials} onChange={value=>set('materials',value)}/><div className="tl-fields"><SingleChoice label="Fit" value={draft.fit} options={fitOptions[currentCategory]||['Slim','Regular','Relaxed','Oversized','Cropped','Tapered','Straight','Wide-leg']} onChange={value=>set('fit',value)} placeholder="Describe the fit"/>{field('measurements','Measurements','text','Include units, e.g. chest 54 cm')}</div></details>
 <details><summary>Purchase details<ChevronDown size={17}/></summary><div className="tl-fields">{field('purchasePrice','Purchase price (USD)','number')}{field('purchaseDate','Purchase date','date')}{field('source','Retailer / source')}</div><p className="tl-hint">Add a price whenever you want to track cost per wear.</p></details>
 <details><summary>Seasons & style<ChevronDown size={17}/></summary><MultiChoices label="Seasons" values={draft.seasons} options={['Spring','Summer','Autumn','Winter','All seasons']} onChange={value=>set('seasons',value)}/><MultiChoices label="Style tags" values={draft.styles} options={['Casual','Classic','Workwear','Sporty','Minimal','Formal','Vintage']} onChange={value=>set('styles',value)}/></details>
 <details><summary>Origins & notes<ChevronDown size={17}/></summary><div className="tl-fields">{field('country','Country of manufacture')}<SingleChoice label="Era" value={draft.era} options={eras} onChange={value=>set('era',value)} placeholder="Add a year or era"/></div><label className="tl-field"><span>Notes</span><textarea value={draft.notes} onChange={e=>set('notes',e.target.value)} placeholder="Alterations, memories, care notes…"/></label></details></div>
}
