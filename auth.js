(() => {
 const $ = id => document.getElementById(id);
 const gate=$('authGate'), status=$('authStatus');
 const url=window.FS_SUPABASE_URL, key=window.FS_SUPABASE_PUBLISHABLE_KEY;
 if(!window.supabase || !url || !key || url.includes('PUNE_') || key.includes('PUNE_')) {
   status.textContent='Configurare Supabase lipsă. Verifică supabase-config.js'; return;
 }
 const client=window.supabase.createClient(url,key);
 let register=false;
 $('authMode').addEventListener('click',()=>{register=!register;$('authAction').textContent=register?'Înregistrare':'Conectare';$('authMode').textContent=register?'Ai cont? Conectare':'Nu ai cont? Înregistrare';status.textContent='';});
 $('authGoogle').addEventListener('click',async()=>{
   status.textContent='Se deschide Google...';
   const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href.split('#')[0]}});
   if(error)status.textContent=error.message;
 });
 $('authAction').addEventListener('click',async()=>{
   status.textContent='Se procesează...';
   const result=register?await client.auth.signUp({email:$('authEmail').value.trim(),password:$('authPassword').value}):await client.auth.signInWithPassword({email:$('authEmail').value.trim(),password:$('authPassword').value});
   status.textContent=result.error?result.error.message:(register?'Verifică emailul pentru confirmare.':'');
   if(!result.error&&!register&&result.data.session)gate.style.display='none';
 });
 $('authForgot').addEventListener('click',async()=>{const email=$('authEmail').value.trim();if(!email){status.textContent='Introdu emailul mai întâi.';return;}const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.href.split('#')[0]});status.textContent=error?error.message:'Email de resetare trimis.';});
 client.auth.getSession().then(({data})=>{if(data.session)gate.style.display='none';});
 client.auth.onAuthStateChange((event,session)=>{gate.style.display=session?'none':'flex';});

 window.fsCloudSavePrefs = async (prefs) => {
   const { data } = await client.auth.getUser();
   if (!data.user) return { error: new Error('Nu ești conectat') };
   return await client.from('fs_user_data').upsert(
     { user_id: data.user.id, prefs, updated_at: new Date().toISOString() },
     { onConflict: 'user_id' }
   );
 };
 window.fsCloudLoadPrefs = async () => {
   const { data } = await client.auth.getUser();
   if (!data.user) return null;
   const { data: row, error } = await client.from('fs_user_data')
     .select('prefs').eq('user_id', data.user.id).maybeSingle();
   if (error) { console.warn('Cloud load:', error.message); return null; }
   return row?.prefs || null;
 };
 window.fsSupabase=client;

})();
