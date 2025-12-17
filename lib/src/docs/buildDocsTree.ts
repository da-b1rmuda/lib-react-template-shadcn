import {
	DocNode,
	DocsTree,
	DocVersionNode,
	DocPageNode,
	DocButtonNode,
	DocDropdownNode,
	DocGroupNode,
} from './types'
import { parseDocFile, ParsedDoc } from './parseDocFile'

/**
 * Вспомогательный тип для промежуточного представления файла
 */
type FileInfo = {
	path: string
	segments: string[]
	parsed: ParsedDoc
}

/**
 * Настройки папки/группы из settings файлов
 */
type FolderSettings = {
	title?: string
	icon?: string
	order?: number
	hidden?: boolean
	dropdown?: 'open' | 'collapsible'
	searchable?: boolean
	description?: string
}

/**
 * Извлекает метаданные из frontmatter с типизацией
 */
function getMetaValue<T>(meta: Record<string, unknown>, key: string, defaultValue: T): T {
	const value = meta[key]
	return (value !== undefined && value !== null ? value : defaultValue) as T
}

/**
 * Генерирует уникальный ID для узла на основе пути
 */
function generateId(path: string): string {
	return path.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
}

/**
 * Определяет, является ли сегмент языковой папкой
 */
function isLanguageFolder(segment: string): boolean {
	// Стандартные языковые коды (можно расширить)
	const languageCodes = ['en', 'ru', 'es', 'fr', 'de', 'zh', 'ja', 'ko']
	return languageCodes.includes(segment.toLowerCase())
}

/**
 * Определяет, является ли сегмент группой (начинается с (group-)
 */
function isGroup(segment: string): boolean {
	return segment.startsWith('(group-') && segment.endsWith(')')
}

/**
 * Извлекает название группы из сегмента
 */
function getGroupName(segment: string): string {
	if (isGroup(segment)) {
		return segment.slice(7, -1) // Убираем "(group-" и ")"
	}
	return segment
}

/**
 * Создает узел страницы
 */
function createPageNode(
	fileInfo: FileInfo,
	filePath: string,
	lang?: string
): DocPageNode {
	const { parsed, path } = fileInfo
	const meta = parsed.meta

	return {
		type: 'page',
		id: generateId(path),
		title:
			getMetaValue(meta, 'title', path.split('/').pop()?.replace('.md', '') || 'Untitled'),
		order: getMetaValue(meta, 'order', 0),
		icon: getMetaValue(meta, 'icon', undefined),
		hidden: getMetaValue(meta, 'hidden', false),
		path: path.replace(/\.md$/, ''),
		filePath,
		lang: lang || getMetaValue(meta, 'lang', undefined),
		tags: getMetaValue(meta, 'tags', undefined),
		content: parsed.type === 'page' ? parsed.content : undefined,
		searchable: getMetaValue(meta, 'searchable', true),
	}
}

/**
 * Создает узел кнопки
 */
function createButtonNode(fileInfo: FileInfo, filePath: string): DocButtonNode {
	const { parsed, path } = fileInfo
	const meta = parsed.meta

	const variant = getMetaValue(meta, 'variant', 'link') as 'link' | 'page'
	const buttonName = path.split('/').pop()?.replace('.button.md', '') || 'Button'

	return {
		type: 'button',
		id: generateId(path),
		title: getMetaValue(meta, 'title', buttonName),
		order: getMetaValue(meta, 'order', 0),
		icon: getMetaValue(meta, 'icon', undefined),
		hidden: getMetaValue(meta, 'hidden', false),
		variant,
		searchable: getMetaValue(meta, 'searchable', true),
		content: parsed.type === 'button' ? parsed.content : undefined,
		...(variant === 'link'
			? {
					url: getMetaValue(meta, 'url', undefined),
					target: getMetaValue(meta, 'target', '_blank' as const),
					style: getMetaValue(meta, 'style', undefined),
				}
			: {
					pagePath: getMetaValue(meta, 'pagePath', undefined),
					filePath,
				}),
	}
}

/**
 * Создает узел dropdown
 */
function createDropdownNode(
	path: string,
	children: DocNode[],
	settings?: FolderSettings
): DocDropdownNode {
	const folderName = path.split('/').pop() || 'Folder'

	return {
		type: 'dropdown',
		id: generateId(path),
		title: settings?.title || folderName,
		order: settings?.order ?? 0,
		icon: settings?.icon,
		hidden: settings?.hidden ?? false,
		path,
		dropdown: settings?.dropdown || 'collapsible',
		searchable: settings?.searchable,
		children,
	}
}

/**
 * Создает узел группы
 */
function createGroupNode(
	path: string,
	groupName: string,
	children: DocNode[],
	settings?: FolderSettings
): DocGroupNode {
	return {
		type: 'group',
		id: generateId(path),
		title: settings?.title || groupName,
		order: settings?.order ?? 0,
		icon: settings?.icon,
		hidden: settings?.hidden ?? false,
		path,
		description: settings?.description,
		children,
	}
}

/**
 * Сортирует узлы по order, затем по title
 */
function sortNodes(nodes: DocNode[]): DocNode[] {
	return [...nodes].sort((a, b) => {
		if (a.order !== b.order) {
			return a.order - b.order
		}
		return a.title.localeCompare(b.title)
	})
}

/**
 * Строит дерево для одной версии
 */
function buildVersionTree(
	files: FileInfo[],
	version: string,
	versionPath: string
): DocVersionNode {
	// Собираем settings файлы
	const settingsMap = new Map<string, FolderSettings>()
	for (const file of files) {
		if (file.parsed.type === 'dropdownSettings' || file.parsed.type === 'groupSettings') {
			// Получаем путь к папке (убираем имя settings файла)
			const folderPath = file.path.substring(0, file.path.lastIndexOf('/'))
			// Нормализуем путь (убираем языковые папки для сопоставления)
			const normalizedPath = folderPath
				.split('/')
				.filter(seg => !isLanguageFolder(seg))
				.join('/')

			const settings: FolderSettings = {
				title: getMetaValue(file.parsed.meta, 'title', undefined),
				icon: getMetaValue(file.parsed.meta, 'icon', undefined),
				order: getMetaValue(file.parsed.meta, 'order', undefined),
				hidden: getMetaValue(file.parsed.meta, 'hidden', undefined),
				dropdown: getMetaValue(file.parsed.meta, 'dropdown', undefined),
				searchable: getMetaValue(file.parsed.meta, 'searchable', undefined),
				description: getMetaValue(file.parsed.meta, 'description', undefined),
			}
			settingsMap.set(normalizedPath, settings)
		}
	}

	// Фильтруем файлы - исключаем settings файлы
	const filesToProcess = files.filter(
		file =>
			file.parsed.type !== 'dropdownSettings' && file.parsed.type !== 'groupSettings'
	)

	// Строим дерево рекурсивно
	// Начинаем с пустого пути, так как все файлы уже относительно версии
	const children = buildTreeRecursive(filesToProcess, '', settingsMap, versionPath)

	return {
		type: 'version',
		version,
		path: versionPath,
		children: sortNodes(children),
	}
}

/**
 * Рекурсивно строит дерево узлов
 */
function buildTreeRecursive(
	files: FileInfo[],
	currentPath: string,
	settingsMap: Map<string, FolderSettings>,
	versionPath: string
): DocNode[] {
	// Группируем файлы по первому сегменту пути (относительно currentPath)
	const groups = new Map<string, FileInfo[]>()
	const directFiles: FileInfo[] = []

	for (const file of files) {
		// Получаем относительный путь от versionPath
		const relativeToVersion = file.path.startsWith(versionPath)
			? file.path.slice(versionPath.length).replace(/^\//, '')
			: file.path

		// Получаем относительный путь от currentPath
		const relativeToCurrent = relativeToVersion.startsWith(currentPath)
			? relativeToVersion.slice(currentPath.length).replace(/^\//, '')
			: relativeToVersion

		// Пропускаем языковые папки
		const segments = relativeToCurrent.split('/').filter(Boolean)
		const filteredSegments = segments.filter(seg => !isLanguageFolder(seg))

		if (filteredSegments.length === 0) {
			continue
		}

		if (filteredSegments.length === 1) {
			// Файл в текущей директории
			directFiles.push(file)
		} else {
			// Файл в поддиректории
			const firstSegment = filteredSegments[0]
			// Пропускаем языковые папки при группировке
			if (!isLanguageFolder(firstSegment)) {
				if (!groups.has(firstSegment)) {
					groups.set(firstSegment, [])
				}
				groups.get(firstSegment)!.push(file)
			}
		}
	}

	const nodes: DocNode[] = []

	// Обрабатываем прямые файлы
	for (const file of directFiles) {
		if (file.parsed.type === 'button') {
			nodes.push(createButtonNode(file, file.path))
		} else if (file.parsed.type === 'page') {
			// Определяем язык из пути
			const langSegment = file.segments.find(isLanguageFolder)
			nodes.push(createPageNode(file, file.path, langSegment))
		}
	}

	// Обрабатываем группы и dropdown
	for (const [segment, groupFiles] of groups) {
		const folderPath = currentPath ? `${currentPath}/${segment}` : segment
		// Нормализуем путь для сопоставления с settings (убираем языковые папки)
		const normalizedPath = folderPath
			.split('/')
			.filter(seg => !isLanguageFolder(seg))
			.join('/')
		const settings = settingsMap.get(normalizedPath)

		if (isGroup(segment)) {
			// Это группа
			const groupName = getGroupName(segment)
			const children = buildTreeRecursive(groupFiles, folderPath, settingsMap, versionPath)
			nodes.push(createGroupNode(folderPath, groupName, children, settings))
		} else {
			// Это обычная папка (dropdown)
			const children = buildTreeRecursive(groupFiles, folderPath, settingsMap, versionPath)
			nodes.push(createDropdownNode(folderPath, children, settings))
		}
	}

	return nodes
}

/**
 * Строит дерево документации из файлов
 *
 * @param files - Объект с путями файлов и их содержимым
 * @returns Дерево документации с версиями
 *
 * @example
 * ```ts
 * const files = {
 *   '/docs/1.0.0/api/auth.md': '---\ntitle: Auth\n---\n# Auth',
 *   '/docs/1.0.0/api/user.md': '---\ntitle: User\n---\n# User',
 * }
 * const tree = buildDocsTree(files)
 * ```
 */
export function buildDocsTree(files: Record<string, string>): DocsTree {
	// Парсим все файлы
	const parsedFiles: FileInfo[] = []
	for (const [path, content] of Object.entries(files)) {
		const parsed = parseDocFile(path, content)
		const segments = path.split('/').filter(Boolean)
		parsedFiles.push({ path, segments, parsed })
	}

	// Группируем файлы по версиям
	// Версия определяется как первый сегмент после корня (например, docs/1.0.0/...)
	const versionsMap = new Map<string, FileInfo[]>()

	for (const file of parsedFiles) {
		// Ищем версию в пути (обычно это второй или третий сегмент)
		// Структура: /docs/1.0.0/... или docs/1.0.0/...
		let version: string | null = null
		let versionPath = ''

		// Пропускаем пустые сегменты и ищем версию
		for (let i = 0; i < file.segments.length; i++) {
			const segment = file.segments[i]
			// Версия обычно выглядит как семантическая версия (1.0.0, 2.0.0-beta и т.д.)
			if (/^\d+\.\d+\.\d+/.test(segment) || /^\d+\.\d+/.test(segment)) {
				version = segment
				versionPath = file.segments.slice(0, i + 1).join('/')
				break
			}
		}

		// Если версия не найдена, используем первый сегмент как версию
		if (!version && file.segments.length > 0) {
			version = file.segments[0]
			versionPath = file.segments[0]
		}

		if (version) {
			if (!versionsMap.has(version)) {
				versionsMap.set(version, [])
			}
			versionsMap.get(version)!.push(file)
		}
	}

	// Строим дерево для каждой версии
	const tree: DocsTree = []
	for (const [version, versionFiles] of versionsMap) {
		const versionPath = versionFiles[0]?.segments
			.slice(0, versionFiles[0].segments.findIndex(s => s === version) + 1)
			.join('/') || version

		tree.push(buildVersionTree(versionFiles, version, versionPath))
	}

	// Сортируем версии по SemVer
	tree.sort((a, b) => {
		// Простая сортировка по версии (можно улучшить с помощью semver библиотеки)
		const aParts = a.version.split('.').map(Number)
		const bParts = b.version.split('.').map(Number)

		for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
			const aPart = aParts[i] || 0
			const bPart = bParts[i] || 0
			if (aPart !== bPart) {
				return bPart - aPart // Новые версии первыми
			}
		}

		return 0
	})

	return tree
}

