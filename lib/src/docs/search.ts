import FlexSearch from 'flexsearch'
import { DocNode, DocPageNode, DocsTree } from './types'

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
 * Индексируются только страницы (DocPageNode), кнопки-линки исключаются.
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

	const addPage = (page: DocPageNode, version: string) => {
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
				if (node.variant === 'page' && node.pagePath) {
					// Ничего не добавляем напрямую: реальные страницы будут
					// проиндексированы как DocPageNode
				}
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


