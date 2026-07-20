import { defineExtension, exposeExtensionWorker, type ExtensionContentNoteDto } from '@neo-anki/extension-sdk'
import { summarizeCollection } from './insights.js'

const extension = defineExtension({
  manifest: {
    format: 'neo-anki-extension', schemaVersion: 2, sdkVersion: 2,
    id: 'org.neoanki.insights', name: 'Memory Insights', version: '2.0.0', publisher: 'NeoAnki contributors',
    publisherKey: 'MCowBQYDK2VwAyEAEWk872RMMdql1/bWKBBp9qEiR1O1lPZkg+BnC1Xs98k=', permissions: ['content:read', 'ui:page'],
    workerEntry: 'dist/worker.js', uiEntries: [{ id: 'page', surface: 'page', entry: 'dist/page.js' }],
    provenance: { sourceCommit: '0000000000000000000000000000000000000000', coreCommit: '23b063f75868a6c104eb5ed157fc44df9179b466', buildSystem: 'neo-anki-extension-cli' },
  },
  async handle(request, host) {
    if (request.type !== 'command' || request.commandId !== 'insights.refresh') {
      const requestId = request.type === 'command' ? request.requestId : request.type === 'planning-signals' ? request.request.requestId : request.operationId
      return { type: 'error', requestId, code: 'unsupported', message: 'Unsupported Insights request.' }
    }
    const notes: ExtensionContentNoteDto[] = []
    let cursor: string | undefined
    let workspaceRevision = 0
    do {
      const page = await host.content.listNotes({ cursor, limit: 500 })
      workspaceRevision = page.workspaceRevision
      notes.push(...page.notes)
      cursor = page.nextCursor
    } while (cursor)
    return { type: 'result', requestId: request.requestId, value: { workspaceRevision, summary: summarizeCollection(notes) } }
  },
})

exposeExtensionWorker(extension)

