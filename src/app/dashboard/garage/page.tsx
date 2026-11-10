"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Bike, Plus, Trash2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Motorcycle={id:string;make:string;model:string;year:number|null;engine_cc:number|null;nickname:string|null;is_primary:boolean};
export default function GaragePage(){
 const [rows,setRows]=useState<Motorcycle[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [make,setMake]=useState("");const [model,setModel]=useState("");const [year,setYear]=useState("");const [cc,setCc]=useState("");const [nickname,setNickname]=useState("");
 const supabase=createClient();
 async function load(){
  setLoading(true);setError("");
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user){setError("Please sign in again.");setLoading(false);return;}
  const {data,error:dbError}=await supabase.from("motorcycles").select("id,make,model,year,engine_cc,nickname,is_primary").eq("owner_id",user.id).order("created_at",{ascending:false});
  if(dbError)setError(dbError.message);else setRows((data||[]) as Motorcycle[]);
  setLoading(false);
 }
 useEffect(()=>{void load();},[]);
 async function addBike(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setSaving(true);setError("");setNotice("");
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setError("Your session has expired. Sign in again.");setSaving(false);return;}
  const {error:dbError}=await supabase.from("motorcycles").insert({owner_id:user.id,make:make.trim(),model:model.trim(),year:year?Number(year):null,engine_cc:cc?Number(cc):null,nickname:nickname.trim()||null,is_primary:rows.length===0});
  if(dbError)setError(dbError.message);else{setMake("");setModel("");setYear("");setCc("");setNickname("");setNotice("Motorcycle added to your garage.");await load();}
  setSaving(false);
 }
 async function removeBike(id:string){
  const {error:dbError}=await supabase.from("motorcycles").delete().eq("id",id);
  if(dbError)setError(dbError.message);else setRows(current=>current.filter(b=>b.id!==id));
 }
 return <main className="min-h-screen bg-[#090b0e] px-5 py-8 text-white"><div className="mx-auto max-w-4xl"><Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-[#9aa4ae]"><ArrowLeft size={14}/> Rider dashboard</Link><div className="mt-8"><div className="eyebrow">YOUR MOTORCYCLES</div><h1 className="display mt-2 text-4xl font-bold">My Garage</h1><p className="mt-2 text-sm text-[#9aa4ae]">Keep your bikes together. Service history and maintenance reminders are coming next.</p></div>
 <section className="panel mt-7 p-5 sm:p-7"><h2 className="font-bold">Add a motorcycle</h2><form onSubmit={addBike} className="mt-5 grid gap-3 sm:grid-cols-2"><input required value={make} onChange={e=>setMake(e.target.value)} placeholder="Brand (e.g. Yamaha)" className="rounded-xl border border-white/10 bg-[#090d12] px-4 py-3 text-sm"/><input required value={model} onChange={e=>setModel(e.target.value)} placeholder="Model (e.g. R15 V4)" className="rounded-xl border border-white/10 bg-[#090d12] px-4 py-3 text-sm"/><input type="number" min="1950" max="2100" value={year} onChange={e=>setYear(e.target.value)} placeholder="Model year" className="rounded-xl border border-white/10 bg-[#090d12] px-4 py-3 text-sm"/><input type="number" min="1" value={cc} onChange={e=>setCc(e.target.value)} placeholder="Engine capacity (CC)" className="rounded-xl border border-white/10 bg-[#090d12] px-4 py-3 text-sm"/><input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="Nickname (optional)" className="rounded-xl border border-white/10 bg-[#090d12] px-4 py-3 text-sm sm:col-span-2"/><button disabled={saving} className="btn-primary flex items-center justify-center gap-2 sm:col-span-2"><Plus size={16}/>{saving?"Saving…":"Add to my garage"}</button></form>{error&&<p className="mt-4 text-sm text-red-400">{error}</p>}{notice&&<p className="mt-4 text-sm text-emerald-400">{notice}</p>}</section>
 <section className="mt-8"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Your bikes</h2><span className="text-xs text-[#89939e]">{rows.length} motorcycles</span></div>{loading?<div className="flex items-center gap-2 py-8 text-sm text-[#89939e]"><Loader2 className="animate-spin" size={16}/> Loading your garage…</div>:rows.length===0?<div className="panel p-8 text-center"><Bike className="mx-auto text-[#ff8065]" size={32}/><p className="mt-3 font-semibold">Your garage is waiting.</p><p className="mt-1 text-sm text-[#89939e]">Add your first motorcycle using the form above.</p></div>:<div className="grid gap-3 sm:grid-cols-2">{rows.map(b=><article key={b.id} className="panel flex items-start gap-4 p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ff5a36]/10 text-[#ff8065]"><Bike/></span><div className="min-w-0 flex-1"><h3 className="font-bold">{b.make} {b.model}</h3><p className="mt-1 text-xs text-[#89939e]">{[b.year,b.engine_cc?b.engine_cc+" CC":null,b.nickname].filter(Boolean).join(" · ")||"Motorcycle"}</p>{b.is_primary&&<span className="mt-3 inline-block rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">PRIMARY BIKE</span>}</div><button onClick={()=>removeBike(b.id)} aria-label="Remove motorcycle" className="rounded-lg p-2 text-[#89939e] hover:bg-red-500/10 hover:text-red-400"><Trash2 size={16}/></button></article>)}</div>}</section></div></main>;
}
