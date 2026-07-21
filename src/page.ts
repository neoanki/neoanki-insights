import { createSandboxedUiClient } from '@neo-anki/extension-sdk'
import type { CollectionInsights } from './insights.js'

const style = document.createElement('style')
style.textContent = `:root{color-scheme:light dark;font:16px/1.5 system-ui,sans-serif}*{box-sizing:border-box}body{margin:0;background:#f7f5ef;color:#172033}main{max-width:1050px;padding:20px}h2{font-size:1.45rem;margin:.2rem 0}p{color:#586476;margin:.3rem 0 1rem}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:12px;margin:18px 0}.metric,.panel{border:1px solid #d5d7d9;border-radius:14px;background:#fff;padding:16px}.metric span{display:block;color:#657083;font-size:.82rem}.metric strong{display:block;margin-top:6px;font-size:1.75rem;font-variant-numeric:tabular-nums}.grid{display:grid;grid-template-columns:1.35fr .85fr;gap:14px}table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid #e3e5e8;text-align:left}th[scope=col]{color:#657083;font-size:.78rem;text-transform:uppercase;letter-spacing:.04em}td{font-variant-numeric:tabular-nums}.tags{display:flex;flex-wrap:wrap;gap:8px}.tag{padding:6px 9px;border-radius:999px;background:#edf2f8;color:#294c70;font-size:.85rem}.status{min-height:24px}.refresh{min-height:44px;padding:8px 14px;border:1px solid #245ea8;border-radius:8px;background:#245ea8;color:white;font:inherit;font-weight:700;cursor:pointer}.refresh:disabled{opacity:.55}:focus-visible{outline:3px solid #5b9be6;outline-offset:2px}@media(max-width:680px){main{padding:14px}.grid{grid-template-columns:1fr}.metric,.panel{padding:14px}}:root[data-theme=dark] body{background:#101721;color:#f3f6fa}:root[data-theme=dark] p{color:#bec7d4}:root[data-theme=dark] .metric,:root[data-theme=dark] .panel{background:#182231;border-color:#3c4859}:root[data-theme=dark] th,:root[data-theme=dark] td{border-color:#344154}:root[data-theme=dark] .tag{background:#243b53;color:#d6e9ff}`
document.head.append(style)
const root = document.getElementById('root')!
root.innerHTML = `<main aria-busy="true"><p>Your collection</p><h2>Collection Insights</h2><p>See today’s workload, deck sizes, common tags, and notes that need attention.</p><button class="refresh" type="button" disabled>Refresh</button><p class="status" role="status" aria-live="polite">Building your summary…</p><div class="content"></div></main>`
const status = root.querySelector<HTMLElement>('.status')!
const content = root.querySelector<HTMLElement>('.content')!
const refresh = root.querySelector<HTMLButtonElement>('.refresh')!

const render = (summary: CollectionInsights, dueToday: number | undefined) => {
  content.replaceChildren()
  const metrics = document.createElement('section'); metrics.className = 'metrics'; metrics.setAttribute('aria-label', 'Collection metrics')
  const values = [['Notes', summary.notes], ['Card projections', summary.cards], ['Decks', summary.decks.length], ['Due today', dueToday ?? '—'], ['Empty answers', summary.emptyAnswers]] as const
  for (const [label, value] of values) { const card = document.createElement('div'); card.className = 'metric'; const caption = document.createElement('span'); caption.textContent = label; const strong = document.createElement('strong'); strong.textContent = String(value); card.append(caption, strong); metrics.append(card) }
  const grid = document.createElement('div'); grid.className = 'grid'
  const decks = document.createElement('section'); decks.className = 'panel'; const deckTitle = document.createElement('h3'); deckTitle.textContent = 'Decks'; const table = document.createElement('table'); table.innerHTML = '<thead><tr><th scope="col">Deck</th><th scope="col">Notes</th><th scope="col">Cards</th></tr></thead>'; const tbody = document.createElement('tbody')
  for (const deck of summary.decks) { const row = document.createElement('tr'); const name = document.createElement('th'); name.scope = 'row'; name.textContent = deck.name; const notes = document.createElement('td'); notes.textContent = String(deck.notes); const cards = document.createElement('td'); cards.textContent = String(deck.cards); row.append(name, notes, cards); tbody.append(row) }
  table.append(tbody); decks.append(deckTitle, table)
  const tags = document.createElement('section'); tags.className = 'panel'; const tagTitle = document.createElement('h3'); tagTitle.textContent = 'Top tags'; const list = document.createElement('div'); list.className = 'tags'
  for (const tag of summary.tags) { const item = document.createElement('span'); item.className = 'tag'; item.textContent = `${tag.name} · ${tag.notes}`; list.append(item) }
  if (!summary.tags.length) { const empty = document.createElement('p'); empty.textContent = 'No tags in the current collection.'; list.append(empty) }
  tags.append(tagTitle, list); grid.append(decks, tags); content.append(metrics, grid)
}

void createSandboxedUiClient().then(async (client) => {
  document.documentElement.dataset.theme = client.init.theme
  const hostSummary = client.init.dto as { summary?: { dueToday?: number } }
  const load = async () => {
    refresh.disabled = true; status.textContent = 'Building your summary…'
    try { const result = await client.call<{ summary: CollectionInsights }>('command', { commandId: 'insights.refresh' }); render(result.summary, hostSummary.summary?.dueToday); status.textContent = 'Collection Insights refreshed.' }
    catch (error) { status.textContent = error instanceof Error ? error.message : 'Collection Insights could not be loaded.' }
    finally { refresh.disabled = false; root.querySelector('main')?.setAttribute('aria-busy', 'false') }
  }
  refresh.onclick = () => void load()
  await load()
}).catch((error) => { root.querySelector('main')?.setAttribute('aria-busy', 'false'); status.textContent = error instanceof Error ? error.message : 'Collection Insights is unavailable.' })
