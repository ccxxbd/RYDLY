import Link from "next/link";
import { redirect } from "next/navigation";
import { Bike, Compass, Users, ShoppingBag, ShieldCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login");
 const name=user.user_metadata?.display_name||user.email?.split("@")[0]||"Rider";
 const items=[
  {icon:Bike,title:"My Garage",desc:"Add your motorcycle and manage its details."},
  {icon:Users,title:"Communities",desc:"Find clubs and riders who share your passion."},
  {icon:Compass,title:"Ride events",desc:"Discover group rides and weekend tours."},
  {icon:ShoppingBag,title:"Marketplace",desc:"Explore motorcycles, parts and riding gear."}
 ];
 return <main className="min-h-screen bg-[#090b0e] px-5 py-8 text-white"><div className="mx-auto max-w-5xl"><header className="flex items-center justify-between border-b border-white/10 pb-5"><Link href="/" className="display text-2xl font-bold">RYDLY<span className="text-[#ff5a36]">.</span></Link><form action="/auth/signout" method="post"><button className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs"><LogOut size={14}/> Sign out</button></form></header><div className="py-10"><div className="eyebrow">YOUR RIDER SPACE</div><h1 className="display mt-3 text-4xl font-bold">Welcome, {name}.</h1><p className="mt-3 text-sm text-[#9aa4ae]">Your riding community starts here.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{items.map(item=><section key={item.title} className="panel p-6"><item.icon className="text-[#ff8065]" size={24}/><h2 className="mt-4 font-bold">{item.title}</h2><p className="mt-2 text-sm text-[#9aa4ae]">{item.desc}</p><span className="mt-4 inline-block text-xs font-bold text-[#ff8065]">Coming next</span></section>)}</div><section className="panel mt-6 p-6"><ShieldCheck className="text-emerald-400" size={20}/><h2 className="mt-3 font-bold">Safety before speed</h2><p className="mt-2 text-sm leading-6 text-[#9aa4ae]">Wear proper protective gear, follow local traffic laws and keep your personal location private unless you intentionally share it.</p></section><p className="mt-8 text-center text-xs text-[#697580]">RYDLY · Bangladesh rider community · Ride together. Go further.</p></div></div></main>;
}
