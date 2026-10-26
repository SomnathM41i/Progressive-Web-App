import fs from 'node:fs'

const CDP = 'http://127.0.0.1:9222'
const APP = 'http://localhost:5173'
const OUT = 'C:/temp/svr-artifacts'
fs.mkdirSync(OUT, { recursive: true })

const stamp = Date.now().toString()
const test = {
  fname: 'Test',
  lname: 'Profile',
  email: `somnath.malim46+svrtest${stamp}@gmail.com`,
  mobile: `9${stamp.slice(-9)}`,
  password: 'Test@12345',
  about: 'This is an automated end to end registration test profile.',
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function newTarget(url) {
  const res = await fetch(`${CDP}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' })
  if (!res.ok) throw new Error(`new target failed ${res.status}`)
  return res.json()
}

class Page {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.id = 0
    this.pending = new Map()
    this.events = []
    this.api = []
    this.console = []
    this.errors = []
  }
  async open() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve
      this.ws.onerror = reject
    })
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.id) {
        const p = this.pending.get(msg.id)
        if (p) {
          this.pending.delete(msg.id)
          if (msg.error) p.reject(new Error(`${p.method}: ${msg.error.message}`))
          else p.resolve(msg.result)
        }
        return
      }
      if (msg.method === 'Network.responseReceived') {
        const r = msg.params.response
        if (r.url.includes('/apis/')) {
          this.api.push({ requestId: msg.params.requestId, url: r.url, status: r.status })
        }
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        const text = msg.params.args.map((a) => a.value ?? a.description ?? '').join(' ')
        this.console.push(`${msg.params.type}: ${text}`)
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        this.errors.push(msg.params.exceptionDetails?.text ?? 'exception')
      }
      if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
        this.errors.push(`${msg.params.entry.source}: ${msg.params.entry.text}`)
      }
      this.events.push(msg)
    }
  }
  send(method, params = {}) {
    const id = ++this.id
    this.ws.send(JSON.stringify({ id, method, params }))
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method })
    })
  }
  async eval(fn, ...args) {
    const expression = `(${fn})(${args.map((a) => JSON.stringify(a)).join(',')})`
    const result = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    })
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
    }
    return result.result.value
  }
  async waitFor(label, fn, timeout = 20000) {
    const started = Date.now()
    let last
    while (Date.now() - started < timeout) {
      try {
        last = await this.eval(fn)
        if (last) return last
      } catch (error) {
        last = String(error)
      }
      await sleep(300)
    }
    throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(last)}`)
  }
  async screenshot(name, full = true) {
    const { data } = await this.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: full,
    })
    fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'))
  }
  async bodyText() {
    return this.eval(() => document.body.innerText)
  }
  async apiBodies() {
    const out = []
    for (const entry of this.api) {
      try {
        const body = await this.send('Network.getResponseBody', { requestId: entry.requestId })
        out.push({ ...entry, body: body.body.slice(0, 2000) })
      } catch {
        out.push(entry)
      }
    }
    return out
  }
}

const target = await newTarget(`${APP}/register/account`)
const page = new Page(target.webSocketDebuggerUrl)
await page.open()
await page.send('Page.enable')
await page.send('Runtime.enable')
await page.send('Network.enable')
await page.send('Log.enable')
await page.send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
})
await page.waitFor('account form', () =>
  document.body.innerText.includes('Create account and continue'),
)
await page.waitFor('account master data', () => {
  const selects = [...document.querySelectorAll('select')]
  return selects.filter((s) => s.options.length > 2).length >= 4
})

await page.screenshot('01-account-empty')

const helpers = {
  setText(label, value) {
    const el = document.querySelectorAll('label')
    const target = [...el].find((l) => l.textContent.trim() === label)
    if (!target) throw new Error(`label not found: ${label}`)
    const input = document.getElementById(target.htmlFor)
    if (!input) throw new Error(`input not found: ${label}`)
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    setter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
    return input.value
  },
  selectByText(label, text) {
    const el = document.querySelectorAll('label')
    const target = [...el].find((l) => l.textContent.trim() === label)
    if (!target) throw new Error(`label not found: ${label}`)
    const select = document.getElementById(target.htmlFor)
    if (!select) throw new Error(`select not found: ${label}`)
    const option = [...select.options].find(
      (o) => o.textContent.trim() === text || o.textContent.trim().startsWith(`${text} (`),
    )
    if (!option) throw new Error(`option ${text} not found for ${label}: ${[...select.options].map((o) => o.textContent.trim()).join('|')}`)
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, option.value)
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return option.textContent.trim()
  },
  selectFirst(label) {
    const el = document.querySelectorAll('label')
    const target = [...el].find((l) => l.textContent.trim() === label)
    if (!target) throw new Error(`label not found: ${label}`)
    const select = document.getElementById(target.htmlFor)
    const option = [...select.options].find((o) => o.value !== '')
    if (!option) throw new Error(`no options for ${label}`)
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set
    setter.call(select, option.value)
    select.dispatchEvent(new Event('change', { bubbles: true }))
    return option.textContent.trim()
  },
}

const log = {}
for (const [label, value] of [
  ['First name', test.fname],
  ['Last name', test.lname],
  ['Email', test.email],
  ['Password', test.password],
  ['Confirm password', test.password],
  ['Mobile number', test.mobile],
  ['About yourself', test.about],
]) {
  log[label] = await page.eval(helpers.setText, label, value)
}
log.Gender = await page.eval(helpers.selectByText, 'Gender', 'Male')
log['Birth day'] = await page.eval(helpers.selectByText, 'Birth day', '15')
log['Birth month'] = await page.eval(helpers.selectByText, 'Birth month', 'May')
log['Birth year'] = await page.eval(helpers.selectByText, 'Birth year', '1995')
log['Marital status'] = await page.eval(helpers.selectByText, 'Marital status', 'Unmarried')
log['Profile created by'] = await page.eval(helpers.selectByText, 'Profile created by', 'Self')
log['Child acceptance'] = await page.eval(helpers.selectByText, 'Child acceptance', 'Do Not Accept Children')
log.Religion = await page.eval(helpers.selectByText, 'Religion', 'Hindu')
await page.waitFor('caste options', () => {
  const labels = [...document.querySelectorAll('label')]
  const l = labels.find((x) => x.textContent.trim() === 'Caste')
  const s = l && document.getElementById(l.htmlFor)
  return s && s.options.length > 1
})
log.Caste = await page.eval(helpers.selectFirst, 'Caste')
log['Country code'] = await page.eval(helpers.selectByText, 'Country code', 'India')
await page.eval(() => {
  const input = document.querySelector('input[type="checkbox"]')
  if (!input.checked) input.click()
  return input.checked
})
await page.screenshot('02-account-filled')

const beforeUrl = await page.eval(() => location.href)
await page.eval(() => {
  const button = [...document.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Create account and continue'),
  )
  if (!button) throw new Error('submit button not found')
  button.click()
  return true
})

try {
  await page.waitFor(
    'register result',
    () => location.pathname !== '/register/account' || document.body.innerText.includes('Could not create account'),
    30000,
  )
} catch {}
await sleep(1000)
await page.screenshot('03-after-account-submit')

const afterUrl = await page.eval(() => location.href)
const body = await page.bodyText()
const session = await page.eval(() => ({
  auth: localStorage.getItem('shivaraj.auth') ?? sessionStorage.getItem('shivaraj.auth'),
  draft: sessionStorage.getItem('shivaraj.registration'),
}))
const api = await page.apiBodies()

console.log(JSON.stringify({
  test,
  beforeUrl,
  afterUrl,
  log,
  url: page.eval(() => location.href),
  session,
  api,
  ui: body.slice(-2500),
  console: page.console.slice(-20),
  errors: page.errors.slice(-20),
}, null, 2))

fs.writeFileSync(`${OUT}/account-result.json`, JSON.stringify({
  test, beforeUrl, afterUrl, log, session, api, ui: body.slice(-5000), console: page.console, errors: page.errors,
}, null, 2))
page.ws.close()
