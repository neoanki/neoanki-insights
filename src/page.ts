import { createSandboxedUiClient } from '@neo-anki/extension-sdk'
import type { CollectionInsights } from './insights.js'

const style = document.createElement('style')
style.textContent = `:root{--ext-text:var(--neo-text,#172033);--ext-soft:var(--neo-text-soft,#586476);--ext-faint:var(--neo-text-faint,#657083);--ext-background:var(--neo-background,#f7f5ef);--ext-surface:var(--neo-surface,#fff);--ext-muted:var(--neo-surface-muted,#edf2f8);--ext-border:var(--neo-border,#d5d7d9);--ext-primary:var(--neo-primary,#245ea8);--ext-primary-hover:var(--neo-primary-hover,#1d4f8d);--ext-primary-soft:var(--neo-primary-soft,#edf2f8);--ext-focus:var(--neo-focus,#5b9be6);--ext-danger:var(--neo-danger,#a33a2d);color-scheme:light dark;font:var(--neo-font-size,16px)/var(--neo-line-height,1.5) var(--neo-font-family,system-ui,sans-serif)}:root[data-theme=dark]{--ext-text:var(--neo-text,#f3f6fa);--ext-soft:var(--neo-text-soft,#bec7d4);--ext-faint:var(--neo-text-faint,#aab5c4);--ext-background:var(--neo-background,#101721);--ext-surface:var(--neo-surface,#182231);--ext-muted:var(--neo-surface-muted,#243b53);--ext-border:var(--neo-border,#3c4859);--ext-primary:var(--neo-primary,#8bbcff);--ext-primary-hover:var(--neo-primary-hover,#a9ceff);--ext-primary-soft:var(--neo-primary-soft,#243b53);--ext-focus:var(--neo-focus,#8bbcff);--ext-danger:var(--neo-danger,#ff9a8d)}*{box-sizing:border-box}body{margin:0;background:transparent;color:var(--ext-text)}main{width:100%;max-width:1050px;padding:4px 0}.toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px}.toolbar p,.status{margin:0;color:var(--ext-soft)}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:12px;margin:18px 0}.metric,.panel{min-width:0;border:1px solid var(--ext-border);border-radius:var(--neo-radius-md,14px);background:var(--ext-surface);padding:16px}.metric span{display:block;color:var(--ext-faint);font-size:.82rem}.metric strong{display:block;margin-top:6px;font-size:1.75rem;font-variant-numeric:tabular-nums}.grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(220px,.85fr);gap:14px}.panel h3{margin:0 0 10px}.table-scroll{max-width:100%;overflow-x:auto}table{width:100%;min-width:340px;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid var(--ext-border);text-align:left}th[scope=col]{color:var(--ext-faint);font-size:.78rem;text-transform:uppercase;letter-spacing:.04em}td{font-variant-numeric:tabular-nums}.tags{display:flex;flex-wrap:wrap;gap:8px}.tag{padding:6px 9px;border-radius:999px;background:var(--ext-primary-soft);color:var(--ext-primary);font-size:.85rem}.status{min-height:24px}.status[role=alert]{color:var(--ext-danger)}.refresh{min-height:44px;padding:8px 14px;border:1px solid var(--ext-primary);border-radius:var(--neo-radius-sm,8px);background:var(--ext-primary);color:white;font:inherit;font-weight:700;cursor:pointer;transition:background-color .18s ease,border-color .18s ease}.refresh:hover:not(:disabled){border-color:var(--ext-primary-hover);background:var(--ext-primary-hover)}.refresh:disabled{opacity:.5;cursor:not-allowed}:focus-visible{outline:3px solid var(--ext-focus);outline-offset:2px}@media(max-width:680px){.toolbar{align-items:stretch;flex-direction:column}.refresh{width:100%}.grid{grid-template-columns:1fr}.metric,.panel{padding:14px}}@media(max-width:420px){.metrics{grid-template-columns:1fr 1fr}.metric strong{font-size:1.45rem}}@media(prefers-reduced-motion:reduce){.refresh{transition:none}}`
document.head.append(style)
const root = document.getElementById('root')!
root.innerHTML = `<main aria-busy="true"><div class="toolbar"><p>Today’s workload, organization, and content health.</p><button class="refresh" type="button" disabled>Refresh</button></div><p class="status" role="status" aria-live="polite">Building your summary…</p><div class="content"></div></main>`
const status = root.querySelector<HTMLElement>('.status')!
const content = root.querySelector<HTMLElement>('.content')!
const refresh = root.querySelector<HTMLButtonElement>('.refresh')!

const render = (summary: CollectionInsights, dueToday: number | undefined) => {
  content.replaceChildren()
  const metrics = document.createElement('section'); metrics.className = 'metrics'; metrics.setAttribute('aria-label', 'Collection metrics')
  const values = [['Notes', summary.notes], ['Card projections', summary.cards], ['Decks', summary.decks.length], ['Due today', dueToday ?? '—'], ['Empty answers', summary.emptyAnswers]] as const
  for (const [label, value] of values) { const card = document.createElement('div'); card.className = 'metric'; const caption = document.createElement('span'); caption.textContent = label; const strong = document.createElement('strong'); strong.textContent = String(value); card.append(caption, strong); metrics.append(card) }
  const grid = document.createElement('div'); grid.className = 'grid'
  const decks = document.createElement('section'); decks.className = 'panel'; const deckTitle = document.createElement('h3'); deckTitle.textContent = 'Decks'; const tableScroll = document.createElement('div'); tableScroll.className = 'table-scroll'; const table = document.createElement('table'); table.innerHTML = '<thead><tr><th scope="col">Deck</th><th scope="col">Notes</th><th scope="col">Cards</th></tr></thead>'; const tbody = document.createElement('tbody')
  for (const deck of summary.decks) { const row = document.createElement('tr'); const name = document.createElement('th'); name.scope = 'row'; name.textContent = deck.name; const notes = document.createElement('td'); notes.textContent = String(deck.notes); const cards = document.createElement('td'); cards.textContent = String(deck.cards); row.append(name, notes, cards); tbody.append(row) }
  if (!summary.decks.length) { const row = document.createElement('tr'); const empty = document.createElement('td'); empty.colSpan = 3; empty.textContent = 'No decks in this workspace.'; row.append(empty); tbody.append(row) }
  table.append(tbody); tableScroll.append(table); decks.append(deckTitle, tableScroll)
  const tags = document.createElement('section'); tags.className = 'panel'; const tagTitle = document.createElement('h3'); tagTitle.textContent = 'Top tags'; const list = document.createElement('div'); list.className = 'tags'
  for (const tag of summary.tags) { const item = document.createElement('span'); item.className = 'tag'; item.textContent = `${tag.name} · ${tag.notes}`; list.append(item) }
  if (!summary.tags.length) { const empty = document.createElement('p'); empty.textContent = 'No tags in the current collection.'; list.append(empty) }
  tags.append(tagTitle, list); grid.append(decks, tags); content.append(metrics, grid)
}

void createSandboxedUiClient().then(async (client) => {
  document.documentElement.dataset.theme = client.init.theme
  const hostSummary = client.init.dto as { summary?: { dueToday?: number } }
  const load = async () => {
    refresh.disabled = true; status.setAttribute('role', 'status'); status.textContent = 'Building your summary…'
    try { const result = await client.call<{ summary: CollectionInsights }>('command', { commandId: 'insights.refresh' }); render(result.summary, hostSummary.summary?.dueToday); status.setAttribute('role', 'status'); status.textContent = 'Collection insights refreshed.' }
    catch (error) { status.setAttribute('role', 'alert'); status.textContent = error instanceof Error ? error.message : 'Collection insights could not be loaded.' }
    finally { refresh.disabled = false; root.querySelector('main')?.setAttribute('aria-busy', 'false') }
  }
  refresh.onclick = () => void load()
  await load()
}).catch((error) => { root.querySelector('main')?.setAttribute('aria-busy', 'false'); status.setAttribute('role', 'alert'); status.textContent = error instanceof Error ? error.message : 'Collection insights is unavailable.' })
