
(() => {
  const $ = id => document.getElementById(id);

  const gate = $('authGate');
  const status = $('authStatus');

  const SITE_URL =
    'https://alexandrujoanta2005-ctrl.github.io/-Farming-Simulator-GUIDE-PRO/';

  const ADMIN_EMAIL = 'alexandrujoanta6@gmail.com';

  const url = window.FS_SUPABASE_URL;
  const key = window.FS_SUPABASE_PUBLISHABLE_KEY;

  if (!gate || !status) {
    console.error('Lipsesc authGate sau authStatus.');
    return;
  }

  if (!window.supabase || !url || !key ||
      url.includes('PUNE_') || key.includes('PUNE_')) {
    status.textContent =
      'Configurare Supabase lipsă. Verifică supabase-config.js';
    return;
  }

  const client = window.supabase.createClient(url, key);
  let register = false;

  function showAdmin(user) {
    const isAdmin =
      user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    window.fsIsAdmin = isAdmin;

    document.body.classList.toggle('fs-is-admin', isAdmin);

    const adminButton =
      $('adminPanelButton') || $('adminBtn') || $('openAdminPanel');

    if (adminButton) {
      adminButton.style.display = isAdmin ? '' : 'none';
    }

    window.dispatchEvent(new CustomEvent('fs-admin-status', {
      detail: { isAdmin, email: user?.email || null }
    }));
  }

  async function setLoggedIn(session) {
    gate.style.display = session ? 'none' : 'flex';
    showAdmin(session?.user || null);
  }

  // Schimbare conectare / înregistrare
  $('authMode')?.addEventListener('click', () => {
    register = !register;

    $('authAction').textContent =
      register ? 'Înregistrare' : 'Conectare';

    $('authMode').textContent =
      register ? 'Ai cont? Conectare' : 'Nu ai cont? Înregistrare';

    status.textContent = '';
  });

  // Autentificare Google
  $('authGoogle')?.addEventListener('click', async () => {
    status.textContent = 'Se deschide Google...';

    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: SITE_URL
      }
    });

    if (error) status.textContent = error.message;
  });

  // Email și parolă
  $('authAction')?.addEventListener('click', async () => {
    status.textContent = 'Se procesează...';

    const email = $('authEmail').value.trim();
    const password = $('authPassword').value;

    if (!email || !password) {
      status.textContent = 'Introdu emailul și parola.';
      return;
    }

    const result = register
      ? await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: SITE_URL }
        })
      : await client.auth.signInWithPassword({
          email,
          password
        });

    status.textContent = result.error
      ? result.error.message
      : register
        ? 'Verifică emailul pentru confirmare.'
        : '';

    if (!result.error && !register && result.data.session) {
      await setLoggedIn(result.data.session);
    }
  });

  // Resetare parolă
  $('authForgot')?.addEventListener('click', async () => {
    const email = $('authEmail').value.trim();

    if (!email) {
      status.textContent = 'Introdu emailul mai întâi.';
      return;
    }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: SITE_URL
    });

    status.textContent = error
      ? error.message
      : 'Email de resetare trimis.';
  });

  // Verificare sesiune existentă
  client.auth.getSession().then(({ data, error }) => {
    if (error) console.warn('Auth session:', error.message);
    setLoggedIn(data?.session || null);
  });

  client.auth.onAuthStateChange((_event, session) => {
    setLoggedIn(session || null);
  });

  // Salvare preferințe în Supabase
  window.fsCloudSavePrefs = async prefs => {
    const { data, error: authError } = await client.auth.getUser();

    if (authError || !data.user) {
      return {
        error: authError || new Error('Nu ești conectat')
      };
    }

    return await client.from('fs_user_data').upsert({
      user_id: data.user.id,
      prefs,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
  };

  // Încărcare preferințe din Supabase
  window.fsCloudLoadPrefs = async () => {
    const { data, error: authError } = await client.auth.getUser();

    if (authError || !data.user) return null;

    const { data: row, error } = await client
      .from('fs_user_data')
      .select('prefs')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (error) {
      console.warn('Cloud load:', error.message);
      return null;
    }

    return row?.prefs || null;
  };

  window.fsSupabase = client;
})();
