import { describe, expect, it } from 'vitest'
import { summarizeCollection } from './insights.js'

describe('collection insights', () => {
  it('deduplicates notes while counting projected cards', () => {
    const result = summarizeCollection([
      { noteId: 'a', profileId: 'p', prompt: 'A', answer: 'B', context: '', deckName: 'One', tags: ['x'] },
      { noteId: 'a', profileId: 'p', prompt: 'A', answer: 'B', context: '', deckName: 'One', tags: ['x'] },
      { noteId: 'b', profileId: 'p', prompt: 'C', answer: '', context: '', deckName: 'Two', tags: ['y'] },
    ])
    expect(result).toMatchObject({ notes: 2, cards: 3, emptyAnswers: 1 })
    expect(result.decks[0]).toEqual({ name: 'One', notes: 1, cards: 2 })
  })
})

