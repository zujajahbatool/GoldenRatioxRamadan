//GoldenRatioxRamadan—App.jsx
import { useState, useEffect } from 'react'
import {
  auth, db,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy
} from './firebase.js'

//CONSTANTS
const CAT = {
  suhoor: '🌅 Suhoor',
  iftar: '🌙 Iftar',
  dessert: '🍮 Dessert'
}

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'Email already registered. Try logging in.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts — wait a moment.'
}

const SAMPLE_RECIPES = [
  {
    id: 'sample-1', name: 'Chicken Biryani', category: 'iftar', servings: 6, mode: 'both',
    ingredients: [
      { item: 'Basmati Rice', amount: 3, unit: 'cups' },
      { item: 'Chicken', amount: 1, unit: 'kg' },
      { item: 'Cumin', amount: 1, unit: 'tsp' },
      { item: 'Salt', amount: 2, unit: 'tbsp' }
    ],
    steps: 'Step 1: Wash rice and soak for 30 mins.\nStep 2: Fry onions until golden.\nStep 3: Add chicken and spices.\nStep 4: Layer rice and chicken. Cook on dum for 25 mins.'
  },
  {
    id: 'sample-2', name: 'Kheer', category: 'dessert', servings: 4, mode: 'both',
    ingredients: [
      { item: 'Milk', amount: 1, unit: 'litre' },
      { item: 'Rice', amount: 0.5, unit: 'cup' },
      { item: 'Sugar', amount: 4, unit: 'tbsp' }
    ],
    steps: 'Step 1: Boil milk on low heat.\nStep 2: Add washed rice.\nStep 3: Stir until thick.\nStep 4: Add sugar and cardamom.'
  },
  {
    id: 'sample-3', name: 'Oatmeal Suhoor Bowl', category: 'suhoor', servings: 2, mode: 'both',
    ingredients: [
      { item: 'Oats', amount: 1, unit: 'cup' },
      { item: 'Honey', amount: 2, unit: 'tbsp' },
      { item: 'Banana', amount: 1, unit: 'pc' }
    ],
    steps: 'Step 1: Cook oats with water for 5 mins.\nStep 2: Slice banana on top.\nStep 3: Drizzle honey.'
  }
]

//HELPERS
function scaleAmount(amount, baseServings, scaledServings) {
  if (!baseServings) return amount
  const result = (amount * scaledServings) / baseServings
  if (result === 0) return 0
  return Number.isInteger(result) ? result : parseFloat(result.toFixed(2))
}

function formatCountdown(ms) {
  if (ms <= 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
}

function friendlyError(code) {
  return AUTH_ERRORS[code] || 'Something went wrong. Try again.'
}

function newIngRow() {
  return { id: Date.now() + Math.random(), item: '', amount: '', unit: '' }
}

//APP
export default function App() {
  //Auth state
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)
  const [showAuth, setShowAuth] = useState(true)
  const [authTab, setAuthTab] = useState('login')

  //Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPwd, setLoginPwd] = useState('')
  const [loginErr, setLoginErr] = useState('')

  //Signup form
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPwd, setSignupPwd] = useState('')
  const [signupErr, setSignupErr] = useState('')

  //Recipes
  const [recipes, setRecipes] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [loading, setLoading] = useState(false)

  //Modals
  const [showAdd, setShowAdd] = useState(false)
  const [readId, setReadId] = useState(null)

  //Add-recipe form
  const [form, setForm] = useState({ name: '', category: 'suhoor', servings: '', steps: '', mode: 'both' })
  const [ings, setIngs] = useState([newIngRow()])
  const [saving, setSaving] = useState(false)

  //Serving-size scaler
  // { recipeId: scaledServings }
  const [scaleMap, setScaleMap] = useState({})

  //Iftar & Suhoor countdown
  const [city, setCity]               = useState('Faisalabad')
  const [country, setCountry]         = useState('PK')
  const [maghrib, setMaghrib]         = useState(null)  // "HH:MM"
  const [fajr, setFajr]               = useState(null)  // "HH:MM"
  const [timerType, setTimerType]     = useState('iftar') // 'iftar' or 'suhoor'
  const [countdown, setCountdown]     = useState('Loading…')
  const [timerPassed, setTimerPassed] = useState(false)
  const [refreshIdx, setRefreshIdx]   = useState(0)

  //TTS
  const [speaking, setSpeaking] = useState(null)

  //Voice input
  const [micActive, setMicActive] = useState(null)

  //AUTH LISTENER
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u)
        setIsGuest(false)
        setShowAuth(false)
        try {
          await loadRecipes(u.uid, false)
        } catch (e) {
          console.error('Failed to load recipes on auth:', e)
        }
      }
    })
    return unsub
  }, [])
  useEffect(() => {
    const controller = new AbortController()

    fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=1`, {
      signal: controller.signal
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (controller.signal.aborted) return
        const timings = data?.data?.timings
        if (timings) {
          if (timings.Maghrib) setMaghrib(timings.Maghrib.split(' ')[0])
          if (timings.Fajr) setFajr(timings.Fajr.split(' ')[0])
        }
      })
      .catch(e => {
        if (controller.signal.aborted) return
        console.error('Failed to fetch prayer times:', e)
        setCountdown('🌙 Times Soon')
      })

    return () => controller.abort()
  }, [city, country, refreshIdx])

  //Countdown tick
  useEffect(() => {
    const timeStr = timerType === 'iftar' ? maghrib : fajr
    if (!timeStr) return
    const tick = () => {
      const now = new Date()
      const [h, m] = timeStr.split(':').map(Number)
      const target = new Date()
      target.setHours(h, m, 0, 0)
      
      const diffSinceTime = now - target
      // If time passed today, show "Time!" for 1 hour, otherwise target tomorrow's time
      if (diffSinceTime >= 0) {
        if (diffSinceTime < 3600000) {
          setTimerPassed(true)
          setCountdown(timerType === 'iftar' ? 'Iftar Time! 🌙' : 'Suhoor Ended 🌅')
          return
        } else {
          target.setDate(target.getDate() + 1)
        }
      }
      
      const diff = target - now
      setTimerPassed(false)
      setCountdown(formatCountdown(diff))
    }
    tick()
    const id = setInterval(tick, 1000)

    const now = new Date()
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now + 1000
    const midId = setTimeout(() => {
      setRefreshIdx(prev => prev + 1)
    }, msUntilMidnight)

    return () => {
      clearInterval(id)
      clearTimeout(midId)
    }
  }, [maghrib, fajr, timerType])

  //RECIPE CRUD
  async function loadRecipes(uid, guest) {
    if (guest || !uid) { setRecipes(SAMPLE_RECIPES); return }
    setLoading(true)
    try {
      const q = query(collection(db, 'users', uid, 'recipes'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) {
      console.error('Load error:', e)
      setRecipes([])
    }
    setLoading(false)
  }

  async function saveRecipe() {
    if (!form.name.trim()) { alert('Please enter a recipe name!'); return }
    if (!form.servings || parseInt(form.servings) < 1) { alert('Please enter valid servings (1+)!'); return }
    const validIngs = ings.filter(i => i.item.trim())
    if (!validIngs.length) { alert('Add at least one ingredient!'); return }

    setSaving(true)
    const timestamp = Date.now()
    const localId = `${timestamp}-${Math.random().toString(36).slice(2)}`
    const recipe = {
      name: form.name.trim(),
      category: form.category,
      servings: parseInt(form.servings) || 4,
      steps: form.steps.trim(),
      mode: form.mode,
      ingredients: validIngs.map(i => ({
        item: i.item.trim(),
        amount: parseFloat(i.amount) || 0,
        unit: i.unit.trim()
      })),
      id: localId
    }

    if (isGuest || !user) {
      setRecipes(prev => [recipe, ...prev])
      setSaving(false)
      closeAdd()
    } else {
      // Optimistically add to UI first for instant feedback
      setRecipes(prev => [recipe, ...prev])
      setSaving(false)
      closeAdd()
      
      try {
        const ref = await addDoc(
          collection(db, 'users', user.uid, 'recipes'),
          { ...recipe, createdAt: timestamp }
        )
        // Update the temporary ID to the real Firebase document ID silently
        setRecipes(prev => prev.map(r => r.id === localId ? { ...r, id: ref.id } : r))
      } catch (e) {
        console.error('Failed to save recipe:', e)
        // Rollback the optimistic update on network failure
        setRecipes(prev => prev.filter(r => r.id !== localId))
        alert('Could not sync recipe to the vault. Check your connection.')
      }
    }
  }

  async function deleteRecipe(id) {
    if (!confirm('Remove this recipe from your vault?')) return
    if (!isGuest && user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'recipes', id))
      } catch (e) {
        console.error('Failed to delete recipe:', e)
        alert('Could not delete recipe. Try again.')
        return  // Abort: don't update local state on failure
      }
    }
    setRecipes(prev => prev.filter(r => r.id !== id))
    setScaleMap(prev => { const n = { ...prev }; delete n[id]; return n })
    if (readId === id) setReadId(null)
  }

  //AUTH ACTIONS
  async function handleLogin() {
    if (!loginEmail || !loginPwd) { setLoginErr('Fill in all fields.'); return }
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPwd)
      setLoginErr('')
    } catch (e) { setLoginErr(friendlyError(e.code)) }
  }

  async function handleSignup() {
    if (!signupName || !signupEmail || !signupPwd) { setSignupErr('Fill in all fields.'); return }
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPwd)
      await updateProfile(cred.user, { displayName: signupName })
      setSignupErr('')
    } catch (e) { setSignupErr(friendlyError(e.code)) }
  }

  async function handleLogout() {
    try {
      await signOut(auth)
      setUser(null); setIsGuest(false); setRecipes([])
      setShowAuth(true); setScaleMap({}); setSpeaking(null)
    } catch (e) {
      console.error('Failed to sign out:', e)
      alert('Could not sign out. Please try again.')
    } finally {
      window.speechSynthesis?.cancel()
    }
  }

  function handleGuest() {
    setIsGuest(true)
    setShowAuth(false)
    loadRecipes(null, true)
  }

  //SCALER
  function getScaled(recipe) {
    return scaleMap[recipe.id] ?? recipe.servings
  }

  function adjustScale(id, delta, baseServings) {
    setScaleMap(prev => {
      const cur = prev[id] ?? baseServings
      return { ...prev, [id]: Math.max(1, cur + delta) }
    })
  }

  function resetScale(id) {
    setScaleMap(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  //MODAL HELPERS
  function openAdd() {
    setForm({ name: '', category: 'suhoor', servings: '', steps: '', mode: 'both' })
    setIngs([newIngRow()])
    setShowAdd(true)
  }
  function closeAdd() { setShowAdd(false) }

  function addIngRow() { setIngs(prev => [...prev, newIngRow()]) }
  function removeIngRow(id) { setIngs(prev => prev.filter(i => i.id !== id)) }
  function updateIng(id, f, v) { setIngs(prev => prev.map(i => i.id === id ? { ...i, [f]: v } : i)) }

  //TTS
  function playRecipe(id) {
    if (speaking === id) {
      window.speechSynthesis.cancel(); setSpeaking(null); return
    }
    window.speechSynthesis.cancel()
    const recipe = recipes.find(r => r.id === id)
    if (!recipe) return
    const scaled = getScaled(recipe)
    const text = [
      `Recipe: ${recipe.name}.`,
      `Serves ${scaled} people.`,
      `Ingredients: ${recipe.ingredients.map(i =>
        `${scaleAmount(i.amount, recipe.servings, scaled)} ${i.unit} of ${i.item}`
      ).join('. ')}.`,
      `Steps: ${recipe.steps || 'No steps added yet.'}`
    ].join(' ')

    if (!window.speechSynthesis) {
      alert('Speech synthesis not supported')
      return
    }
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9; utt.pitch = 1; utt.lang = 'en-US'
    utt.onend = () => setSpeaking(null)
    utt.onerror = () => { setSpeaking(null); console.error('Speech synthesis error') }
    try {
      window.speechSynthesis.speak(utt)
      setSpeaking(id)
    } catch (e) {
      console.error('Failed to play recipe:', e)
      alert('Could not play recipe. Try again.')
      setSpeaking(null)
    }
  }

  function startVoice(field) {
    if (micActive) return  // Already recording
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Voice input needs Chrome.'); return }
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = field === 'steps'
    setMicActive(field)
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(' ')
      if (t.trim()) {  // Only update if transcription is not empty
        setForm(prev => ({
          ...prev,
          [field]: (prev[field] ? prev[field] + ' ' : '') + t.trim()
        }))
      }
    }
    rec.onend = () => setMicActive(null)
    rec.onerror = (e) => {
      console.error('Speech recognition error:', e.error)
      setMicActive(null)
      alert('Voice input failed. Please try again.')
    }
    rec.start()
  }

  //DOWNLOAD AS TEXT
  function downloadRecipe(id) {
    const recipe = recipes.find(r => r.id === id)
    if (!recipe) return
    const scaled = getScaled(recipe)
    const lines = [
      '══════════════════════════════════════',
      '  GoldenRatioxRamadan — Recipe Card',
      '══════════════════════════════════════',
      '',
      `Recipe  : ${recipe.name}`,
      `Category: ${CAT[recipe.category]}`,
      `Servings: ${scaled}${scaled !== recipe.servings ? ` (scaled from ${recipe.servings})` : ''}`,
      '',
      '── INGREDIENTS ──────────────────────',
      ...recipe.ingredients.map(i =>
        `  • ${scaleAmount(i.amount, recipe.servings, scaled)} ${i.unit}  ${i.item}`
      ),
      '',
      '── STEPS ────────────────────────────',
      recipe.steps
        ? recipe.steps.split('\n').filter(s => s.trim()).map(s => `  ${s.trim()}`).join('\n')
        : '  No steps added yet.',
      '',
      '══════════════════════════════════════',
      '  Saved from GoldenRatioxRamadan'
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${recipe.name.replace(/\s+/g, '_')}_recipe.txt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  //DERIVED STATE
  const filtered = activeCat === 'all' ? recipes : recipes.filter(r => r.category === activeCat)
  const readRecipe = recipes.find(r => r.id === readId) ?? null

  //RENDER
  return (
    <>
      {/*AUTH OVERLAY*/}
      {showAuth && (
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="auth-logo">🌙 GoldenRatio<span>×</span>Ramadan</div>
            <div className="auth-divider">✦ ── ── ── ✦</div>

            <div className="auth-tabs">
              <button
                className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthTab('login'); setLoginErr(''); setSignupErr('') }}
              >Login</button>
              <button
                className={`auth-tab ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthTab('signup'); setLoginErr(''); setSignupErr('') }}
              >Sign Up</button>
            </div>

            {authTab === 'login' ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input" type="email"
                    value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    className="form-input" type="password"
                    value={loginPwd} onChange={e => setLoginPwd(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                {loginErr && <div className="auth-error">{loginErr}</div>}
                <button className="btn-primary auth-btn" onClick={handleLogin}>Login to Your Vault</button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="e.g. Fatima" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={signupPwd} onChange={e => setSignupPwd(e.target.value)} placeholder="Min 6 characters" />
                </div>
                {signupErr && <div className="auth-error">{signupErr}</div>}
                <button className="btn-primary auth-btn" onClick={handleSignup}>Create My Vault</button>
                <div className="auth-guest">
                  <p>Just browsing? <button className="btn-guest" onClick={handleGuest}>Continue as Guest</button></p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/*HEADER*/}
      <header className="header">
        <div className="header-left">
          <div className="logo">GoldenRatio<span>×</span>Ramadan</div>
          <div className="logo-divider">✦ ── ── ── ✦</div>
          <p className="tagline">Your precision kitchen vault for Ramadan</p>
        </div>

        <div className="header-right">
          {/* Live iftar/suhoor countdown */}
          <div className="timer-switch-wrapper">
            <div className="timer-switcher">
              <button 
                className={`timer-switch-btn ${timerType === 'suhoor' ? 'active' : ''}`}
                onClick={() => setTimerType('suhoor')}
              >🌅 Suhoor</button>
              <button 
                className={`timer-switch-btn ${timerType === 'iftar' ? 'active' : ''}`}
                onClick={() => setTimerType('iftar')}
              >🌙 Iftar</button>
            </div>
            <div className={`iftar-pill ${timerPassed ? 'iftar-now' : ''}`}>
              {timerType === 'iftar' ? '🕌 ' : '🕰 '}
              {timerPassed ? countdown : `${timerType === 'iftar' ? 'Iftar' : 'Suhoor'} in ${countdown}`}
            </div>
          </div>

          {isGuest && (
            <div className="profile-badge guest-badge">
              <div className="profile-avatar guest-avatar">👤</div>
              <div className="profile-info">
                <div className="profile-name">Guest</div>
                <div className="profile-email">Browsing as guest</div>
              </div>
              <button
                className="btn-login-from-guest"
                onClick={() => { setIsGuest(false); setShowAuth(true) }}
              >Login / Sign Up</button>
            </div>
          )}

          {user && (
            <div className="profile-badge">
              <div className="profile-avatar">{(user.displayName || 'C')[0].toUpperCase()}</div>
              <div className="profile-info">
                <div className="profile-name">{user.displayName || 'Chef'}</div>
                <div className="profile-email">{user.email}</div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      {/*MAIN*/}
      <main className="container">
        {/*TABS + ADD BUTTON*/}
        <div className="tabs-wrapper">
          <div className="tabs">
            {[['all', '✦ All'], ['suhoor', CAT.suhoor], ['iftar', CAT.iftar], ['dessert', CAT.dessert]].map(([cat, label]) => (
              <button
                key={cat}
                className={`tab ${activeCat === cat ? 'active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >{label}</button>
            ))}
          </div>
          <button className="btn-add-recipe" onClick={openAdd}>＋ Add Recipe</button>
        </div>

        {/*LOADING*/}
        {loading && <div className="loading-state">Loading your vault…</div>}

        {/*EMPTY STATE*/}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🫙</div>
            <h2 className="empty-title">Your Vault is Empty</h2>
            <p className="empty-text">Add your first Golden Ratio recipe and never guess seasoning again!</p>
            <button className="btn-primary" onClick={openAdd}>＋ Add Your First Recipe</button>
          </div>
        )}

        {/*RECIPE GRID*/}
        {!loading && filtered.length > 0 && (
          <div className="recipe-grid">
            {filtered.map(recipe => {
              const scaled = getScaled(recipe)
              const isPlaying = speaking === recipe.id
              const mode = recipe.mode || 'both'
              const isScaled = scaled !== recipe.servings

              return (
                <div className="recipe-card" key={recipe.id}>
                  <div className="recipe-card-header">
                    <div className="recipe-card-name">{recipe.name}</div>
                    <div className="recipe-card-badge">{CAT[recipe.category]}</div>
                  </div>

                  {/*SERVING SCALER*/}
                  <div className={`scaler-row ${isScaled ? 'scaler-active' : ''}`}>
                    <span className="scaler-label">👤 Servings</span>
                    <div className="scaler-ctrl">
                      <button
                        className="scaler-btn"
                        onClick={() => adjustScale(recipe.id, -1, recipe.servings)}
                        disabled={scaled <= 1}
                        aria-label="Decrease servings"
                      >−</button>
                      <span className="scaler-val">{scaled}</span>
                      <button
                        className="scaler-btn"
                        onClick={() => adjustScale(recipe.id, +1, recipe.servings)}
                        aria-label="Increase servings"
                      >＋</button>
                      {isScaled && (
                        <button
                          className="scaler-reset"
                          onClick={() => resetScale(recipe.id)}
                          title={`Reset to ${recipe.servings}`}
                        >↺</button>
                      )}
                    </div>
                  </div>

                  {/*INGREDIENTS (live-scaled)*/}
                  <div className="recipe-card-ingredients">
                    {recipe.ingredients.map((ing, i) => (
                      <div className="ingredient-chip" key={i}>
                        {ing.item}: <b>{scaleAmount(ing.amount, recipe.servings, scaled)} {ing.unit}</b>
                      </div>
                    ))}
                  </div>

                  {/*ACTIONS*/}
                  <div className="recipe-card-footer">
                    {(mode === 'both' || mode === 'read') && (
                      <button className="btn-read" onClick={() => setReadId(recipe.id)}>📖 Read</button>
                    )}
                    {(mode === 'both' || mode === 'listen') && (
                      <button
                        className={`btn-play ${isPlaying ? 'is-playing' : ''}`}
                        onClick={() => playRecipe(recipe.id)}
                      >{isPlaying ? '⏹ Stop' : '▶ Listen'}</button>
                    )}
                    <button className="btn-delete" onClick={() => deleteRecipe(recipe.id)}>🗑</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/*ADD RECIPE MODAL*/}
      {showAdd && (
        <div
          className="modal-overlay open"
          onClick={e => { if (e.target.classList.contains('modal-overlay')) closeAdd() }}
        >
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">✦ Add New Recipe</h2>
              <button className="modal-close" onClick={closeAdd}>✕</button>
            </div>
            <div className="modal-body">

              {/*Recipe Name*/}
              <div className="form-group">
                <label className="form-label">Recipe Name</label>
                <div className="input-mic-row">
                  <input
                    className="form-input" type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Chicken Biryani"
                  />
                  <button
                    className={`btn-mic ${micActive === 'name' ? 'mic-on' : ''}`}
                    onClick={() => startVoice('name')}
                    title="Voice input"
                  >{micActive === 'name' ? '🔴' : '🎙'}</button>
                </div>
              </div>

              {/*Category*/}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                >
                  <option value="suhoor">🌅 Suhoor</option>
                  <option value="iftar">🌙 Iftar</option>
                  <option value="dessert">🍮 Dessert</option>
                </select>
              </div>

              {/*Servings*/}
              <div className="form-group">
                <label className="form-label">Base Servings</label>
                <input
                  className="form-input" type="number"
                  value={form.servings}
                  onChange={e => setForm(p => ({ ...p, servings: e.target.value }))}
                  placeholder="e.g. 4" min="1"
                />
              </div>

              {/*Mode*/}
              <div className="form-group">
                <label className="form-label">Recipe Mode</label>
                <div className="mode-selector">
                  {[['both', '📖🔊 Read & Listen'], ['read', '📖 Read Only'], ['listen', '🔊 Listen Only']].map(([m, l]) => (
                    <button
                      key={m}
                      className={`mode-btn ${form.mode === m ? 'active' : ''}`}
                      onClick={() => setForm(p => ({ ...p, mode: m }))}
                    >{l}</button>
                  ))}
                </div>
              </div>

              {/*Ingredients*/}
              <div className="form-group">
                <label className="form-label">Ingredients</label>
                <div className="ingredients-list">
                  {ings.map(ing => (
                    <div className="ingredient-row" key={ing.id}>
                      <input
                        className="form-input"
                        type="text" value={ing.item}
                        onChange={e => updateIng(ing.id, 'item', e.target.value)}
                        placeholder="Ingredient"
                      />
                      <input
                        className="form-input"
                        type="number" value={ing.amount}
                        onChange={e => updateIng(ing.id, 'amount', e.target.value)}
                        placeholder="Qty" min="0" step="0.1"
                      />
                      <input
                        className="form-input"
                        type="text" value={ing.unit}
                        onChange={e => updateIng(ing.id, 'unit', e.target.value)}
                        placeholder="Unit"
                      />
                      <button
                        className="btn-remove-ing"
                        onClick={() => removeIngRow(ing.id)}
                        disabled={ings.length === 1}
                      >✕</button>
                    </div>
                  ))}
                </div>
                <button className="btn-add-ingredient" onClick={addIngRow}>＋ Add Ingredient</button>
              </div>

              {/*Steps*/}
              <div className="form-group">
                <label className="form-label">Cooking Steps</label>
                <div className="input-mic-row">
                  <textarea
                    className="form-input form-textarea"
                    value={form.steps}
                    onChange={e => setForm(p => ({ ...p, steps: e.target.value }))}
                    placeholder="Step 1: Wash rice…&#10;Step 2: Fry onions…"
                  />
                  <button
                    className={`btn-mic ${micActive === 'steps' ? 'mic-on' : ''}`}
                    onClick={() => startVoice('steps')}
                    title="Voice input"
                  >{micActive === 'steps' ? '🔴' : '🎙'}</button>
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeAdd}>Cancel</button>
              <button className="btn-primary" onClick={saveRecipe} disabled={saving}>
                {saving ? 'Saving…' : '✦ Save to Vault'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*READ RECIPE MODAL*/}
      {readRecipe && (
        <div
          className="modal-overlay open"
          onClick={e => { if (e.target.classList.contains('modal-overlay')) setReadId(null) }}
        >
          <div className="modal read-modal">
            <div className="modal-header">
              <h2 className="modal-title">📖 {readRecipe.name}</h2>
              <button className="modal-close" onClick={() => setReadId(null)}>✕</button>
            </div>
            <div className="modal-body">

              {/*Scaler in read modal*/}
              <div className="read-scaler-bar">
                <span className="recipe-read-meta">
                  {CAT[readRecipe.category]}
                </span>
                <div className="scaler-ctrl">
                  <span className="scaler-label-sm">Servings:</span>
                  <button
                    className="scaler-btn"
                    onClick={() => adjustScale(readRecipe.id, -1, readRecipe.servings)}
                    disabled={getScaled(readRecipe) <= 1}
                  >−</button>
                  <span className="scaler-val">{getScaled(readRecipe)}</span>
                  <button
                    className="scaler-btn"
                    onClick={() => adjustScale(readRecipe.id, +1, readRecipe.servings)}
                  >＋</button>
                  {getScaled(readRecipe) !== readRecipe.servings && (
                    <button
                      className="scaler-reset"
                      onClick={() => resetScale(readRecipe.id)}
                    >↺ Reset</button>
                  )}
                </div>
              </div>

              {/*Ingredients*/}
              <div className="recipe-read-section">
                <h3>Ingredients</h3>
                <div className="recipe-read-ingredients">
                  {readRecipe.ingredients.map((ing, i) => (
                    <div className="recipe-read-ingredient-item" key={i}>
                      <span className="ing-qty">
                        {scaleAmount(ing.amount, readRecipe.servings, getScaled(readRecipe))} {ing.unit}
                      </span>
                      <span>{ing.item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/*Steps*/}
              <div className="recipe-read-section">
                <h3>Cooking Steps</h3>
                <div className="recipe-read-steps">
                  {readRecipe.steps
                    ? readRecipe.steps.split('\n').filter(s => s.trim()).map((step, i) => (
                      <div className="recipe-read-step" key={i}>{step.trim()}</div>
                    ))
                    : <div className="recipe-read-step" style={{ opacity: 0.6 }}>No steps added yet.</div>
                  }
                </div>
              </div>

            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => downloadRecipe(readRecipe.id)}>⬇ Save as Text</button>
              <button className="btn-primary" onClick={() => setReadId(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
