import type { ExtensionContentNoteDto } from '@neo-anki/extension-sdk'

export interface CollectionInsights {
  notes: number
  cards: number
  decks: Array<{ name: string; notes: number; cards: number }>
  tags: Array<{ name: string; notes: number }>
  emptyAnswers: number
}

export const summarizeCollection = (notes: readonly ExtensionContentNoteDto[]): CollectionInsights => {
  const deckNotes = new Map<string, Set<string>>()
  const deckCards = new Map<string, number>()
  const tagNotes = new Map<string, Set<string>>()
  let emptyAnswers = 0
  for (const note of notes) {
    const deck = note.deckName.trim() || 'Default'
    const inDeck = deckNotes.get(deck) || new Set<string>()
    inDeck.add(note.noteId)
    deckNotes.set(deck, inDeck)
    deckCards.set(deck, (deckCards.get(deck) || 0) + 1)
    for (const tag of note.tags) {
      const normalized = tag.trim()
      if (!normalized) continue
      const tagged = tagNotes.get(normalized) || new Set<string>()
      tagged.add(note.noteId)
      tagNotes.set(normalized, tagged)
    }
    if (!note.answer.trim()) emptyAnswers += 1
  }
  return {
    notes: new Set(notes.map((note) => note.noteId)).size,
    cards: notes.length,
    decks: [...deckNotes].map(([name, ids]) => ({ name, notes: ids.size, cards: deckCards.get(name) || ids.size })).sort((left, right) => right.cards - left.cards || left.name.localeCompare(right.name)),
    tags: [...tagNotes].map(([name, ids]) => ({ name, notes: ids.size })).sort((left, right) => right.notes - left.notes || left.name.localeCompare(right.name)).slice(0, 20),
    emptyAnswers,
  }
}

