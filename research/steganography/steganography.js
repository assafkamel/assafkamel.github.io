(() => {
  const $ = (id) => document.getElementById(id);
  const apiInput = $('api-base');
  const state = $('connection-state');
  const authState = $('auth-state');
  const workspace = $('workspace');
  const loginForm = $('login-form');
  const result = $('result');
  let apiBase = localStorage.getItem('steganoApiBase') || '';
  let authenticated = false;
  apiInput.value = apiBase;

  function endpoint(path) {
    if (!apiBase) throw new Error('Set your API base URL first.');
    return apiBase.replace(/\/$/, '') + path;
  }
  async function request(path, options = {}) {
    const response = await fetch(endpoint(path), {
      credentials: 'include',
      ...options,
      headers: { ...(options.headers || {}) }
    });
    if (!response.ok) {
      let message = 'Request failed (' + response.status + ')';
      try { const data = await response.json(); message = data.error || data.message || message; } catch {}
      throw new Error(message);
    }
    return response;
  }
  function setAuthenticated(value, label) {
    authenticated = value;
    workspace.hidden = !value;
    $('logout').hidden = !value;
    authState.textContent = label;
  }
  $('save-api').addEventListener('click', () => {
    try {
      const parsed = new URL(apiInput.value.trim());
      if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && !/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(parsed.hostname)) {
        throw new Error('Use HTTPS for non-local servers.');
      }
      apiBase = parsed.toString().replace(/\/$/, '');
      localStorage.setItem('steganoApiBase', apiBase);
      state.textContent = 'Endpoint saved: ' + apiBase;
    } catch (error) { state.textContent = error.message || 'Enter a valid API URL.'; }
  });
  $('check-api').addEventListener('click', async () => {
    try { const r = await request('/health'); const data = await r.json(); state.textContent = 'Service available' + (data.version ? ' · ' + data.version : '.'); }
    catch (error) { state.textContent = error.message; }
  });
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector('button[type=submit]');
    button.disabled = true;
    try {
      const response = await request('/auth/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({username:$('username').value,password:$('password').value}) });
      const data = await response.json();
      $('password').value = '';
      setAuthenticated(true, data.username ? 'Signed in as ' + data.username : 'Signed in');
    } catch (error) { setAuthenticated(false, 'Sign-in failed: ' + error.message); }
    finally { button.disabled = false; }
  });
  $('logout').addEventListener('click', async () => {
    try { await request('/auth/logout', {method:'POST'}); } catch (error) { authState.textContent = 'Sign-out request: ' + error.message; }
    setAuthenticated(false, 'Signed out');
  });
  async function submitImage(form, path, isEncode) {
    const button = form.querySelector('button[type=submit]');
    button.disabled = true; result.hidden = false; result.textContent = 'Processing image…';
    try {
      const data = new FormData(form);
      const response = await request(path, {method:'POST', body:data});
      if (isEncode) {
        const blob = await response.blob();
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename="?([^";]+)"?/i);
        const filename = match ? match[1] : 'steganography-output.png';
        const url = URL.createObjectURL(blob);
        result.textContent = 'Image processed successfully. ';
        const link = document.createElement('a'); link.href = url; link.download = filename; link.textContent = 'Download encoded image'; result.append(link);
      } else {
        const payload = await response.json();
        result.textContent = payload.message ?? payload.text ?? 'The server returned a response without a message field.';
      }
    } catch (error) { result.textContent = 'Processing failed: ' + error.message; }
    finally { button.disabled = false; }
  }
  $('encode-form').addEventListener('submit', e => {e.preventDefault();submitImage(e.currentTarget,'/encode',true);});
  $('decode-form').addEventListener('submit', e => {e.preventDefault();submitImage(e.currentTarget,'/decode',false);});
  function tab(which) {
    const encode = which === 'encode';
    $('encode-pane').hidden = !encode; $('decode-pane').hidden = encode;
    $('encode-tab').classList.toggle('active',encode); $('decode-tab').classList.toggle('active',!encode);
    $('encode-tab').setAttribute('aria-selected',String(encode)); $('decode-tab').setAttribute('aria-selected',String(!encode));
  }
  $('encode-tab').addEventListener('click',()=>tab('encode'));
  $('decode-tab').addEventListener('click',()=>tab('decode'));
  if (apiBase) state.textContent = 'Configured endpoint: ' + apiBase;
  // Re-check session on page load; the API must implement this endpoint.
  if (apiBase) request('/auth/me').then(r=>r.json()).then(data=>setAuthenticated(true,data.username?'Signed in as '+data.username:'Signed in')).catch(()=>setAuthenticated(false,'Signed out'));
})();