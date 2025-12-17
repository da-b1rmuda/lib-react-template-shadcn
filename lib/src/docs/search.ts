import FlexSearch from 'flexsearch'
import { DocButtonNode, DocNode, DocPageNode, DocsTree } from './types'

/**
 * Модель документа для индексации
 */
export type SearchDocument = {
	id: string
	title: string
	content: string
	version: string
	path: string
	lang?: string
}

/**
 * Результат поиска
 */
export type SearchResult = {
	doc: SearchDocument
	score?: number
}

/**
 * Создаёт индекс FlexSearch по дереву документации.
 * Индексируются только страницы (DocPageNode) и связанные с ними page-кнопки.
 * link-кнопки и элементы с searchable: false не индексируются.
 */
export function buildSearchIndex(tree: DocsTree) {
	const index = new FlexSearch.Document<SearchDocument, true>({
		tokenize: 'forward',
		document: {
			id: 'id',
			index: ['title', 'content', 'path'],
			store: ['id', 'title', 'content', 'version', 'path', 'lang'],
		},
	})

	const documents: Record<string, SearchDocument> = {}

	// Собираем пути страниц, которые НЕ должны участвовать в поиске
	const blockedPagePaths = new Set<string>()

	const collectBlockedFromButtons = (nodes: DocNode[]) => {
		for (const node of nodes) {
			if (node.type === 'button') {
				const btn = node as DocButtonNode
				// link-кнопки игнорируем полностью
				if (btn.variant === 'page' && btn.searchable === false && btn.pagePath) {
					blockedPagePaths.add(btn.pagePath)
				}
			}

			if ('children' in node && node.children?.length) {
				collectBlockedFromButtons(node.children)
			}
		}
	}

	for (const versionNode of tree) {
		collectBlockedFromButtons(versionNode.children)
	}

	const addPage = (page: DocPageNode, version: string) => {
		// Страницы с searchable: false или явно заблокированные по pagePath не индексируем
		if (page.searchable === false || blockedPagePaths.has(page.path)) {
			return
		}

		const doc: SearchDocument = {
			id: page.id,
			title: page.title,
			content: page.content || '',
			version,
			path: page.path,
			lang: page.lang,
		}
		documents[doc.id] = doc
		index.add(doc)
	}

	const walkNodes = (nodes: DocNode[], version: string) => {
		for (const node of nodes) {
			if (node.hidden) continue

			if (node.type === 'page') {
				addPage(node, version)
				continue
			}

			// Кнопки variant: 'link' сознательно НЕ индексируем
			// (условие задачи: исключение link buttons)
			if (node.type === 'button') {
				// variant: 'page' влияет только на searchable через pagePath (обработано выше)
				continue
			}

			if ('children' in node && node.children?.length) {
				walkNodes(node.children, version)
			}
		}
	}

	for (const versionNode of tree) {
		walkNodes(versionNode.children, versionNode.version)
	}

	const search = (query: string): SearchResult[] => {
		if (!query.trim()) return []

		// FlexSearch.Document возвращает id по каждому полю,
		// собираем уникальные id с возможным скором.
		const raw = index.search(query, {
			enrich: true,
		}) as Array<{
			field: string
			result: Array<{ id: string; score: number }>
		}>

		const scores = new Map<string, number>()

		for (const fieldResult of raw) {
			for (const { id, score } of fieldResult.result) {
				const prev = scores.get(id) ?? 0
				// Берём максимальный скор по полям
				if (score > prev) {
					scores.set(id, score)
				}
			}
		}

		return Array.from(scores.entries())
			.sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
			.map(([id, score]) => ({
				doc: documents[id],
				score,
			}))
			.filter(r => !!r.doc)
	}

	return { search }
}


