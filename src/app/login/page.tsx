"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage(){
 const router=useRouter();
 const [signup,setSignup]=useState(true);
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setNotice("");setError("");
  try{
   const supabase=createClient();
   if(signup){
    const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name,preferred_language:"en",country_code:"BD"},emailRedirectTo:window.location.origin+"/auth/callback"}});
    if(error)throw error;
    if(data.session){router.push("/dashboard");router.refresh();}else setNotice("Account created. Check your email to confirm, then sign in.");
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)throw error;router.push("/dashboard");router.refresh();
   }
  }catch(err){setError(err instanceof Error?err.message:"Please try again.");}finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#090b0e] px-5 py-12 text-white"><div className="mx-auto max-w-md"><Link href="/" className="display text-3xl font-bold">RYDLY<span className="text-[#ff5a36]">.</span></Link><div className="panel mt-10 p-7 sm:p-9"><div className="eyebrow">YOUR RIDER COMMUNITY</div><h1 className="display mt-3 text-3xl font-bold">{signup?"Join RYDLY":"Welcome back"}</h1><p className="mt-2 text-sm text-[#9aa4ae]">{signup?"Create your rider account to get started.":"Sign in to continue."}</p><form onSubmit={submit} className="mt-7 space-y-4">{signup&&<label className="block text-xs">Rider name<input required value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d12] p-3 text-sm" placeholder="Your name"/></label>}<label className="block text-xs">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d12] p-3 text-sm" placeholder="you@example.com"/></label><label className="block text-xs">Password<input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090d12] p-3 text-sm" placeholder="At least 8 characters"/></label>{error&&<p className="text-sm text-red-400">{error}</p>}{notice&&<p className="text-sm text-emerald-400">{notice}</p>}<button disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy?"Please wait…":signup?"Create rider account":"Sign in"}</button></form><p className="mt-6 text-center text-sm text-[#9aa4ae]">{signup?"Already have an account?":"New to RYDLY?"} <button onClick={()=>{setSignup(!signup);setError("");setNotice("");}} className="font-bold text-[#ff8065]">{signup?"Sign in":"Create account"}</button></p></div><p className="mt-6 text-center text-xs text-[#697580]">বাংলাদেশের রাইডার কমিউনিটি · Ride responsibly.</p></div></main>;
}
