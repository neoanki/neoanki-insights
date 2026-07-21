import { defineExtension, exposeExtensionWorker, type ExtensionContentNoteDto } from '@neo-anki/extension-sdk'
import { summarizeCollection } from './insights.js'

const extension = defineExtension({
  manifest: {
    format: 'neo-anki-extension', schemaVersion: 2, sdkVersion: 2,
    id: 'org.neoanki.insights', name: 'Collection Insights', version: '2.0.2', minimumNeoAnkiVersion: '0.4.0', publisher: 'NeoAnki contributors',
    publisherKey: 'MCowBQYDK2VwAyEAEWk872RMMdql1/bWKBBp9qEiR1O1lPZkg+BnC1Xs98k=', permissions: ['content:read', 'ui:page'],
    workerEntry: 'dist/worker.js', uiEntries: [{ id: 'page', surface: 'page', entry: 'dist/page.js', label: 'Collection Insights', description: 'See collection health, due work, common tags, and items needing attention.', icon: 'chart-no-axes-column', launchDestination: 'extension-page' }],
    provenance: { sourceCommit: '0000000000000000000000000000000000000000', coreCommit: '7ad6541f1e4a15553d6ffd31c70708ae193691fe', buildSystem: 'neo-anki-extension-cli' },
  },
  async handle(request, host) {
    if (request.type !== 'command' || request.commandId !== 'insights.refresh') {
      const requestId = request.type === 'planning-signals' ? request.request.requestId : request.type === 'cancel' ? request.operationId : request.requestId
      return { type: 'error', requestId, code: 'unsupported', message: 'Collection Insights cannot handle this request.' }
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
