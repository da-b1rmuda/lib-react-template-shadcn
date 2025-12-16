/**
 * Базовый тип узла документации
 */
export type BaseNode = {
	id: string
	title: string
	order: number
	icon?: string
	hidden?: boolean
}

/**
 * Страница документации
 * Файл: something.md
 */
export type DocPageNode = BaseNode & {
	type: 'page'
	path: string
	filePath: string
	lang?: string
	tags?: string[]
	content?: string
}

/**
 * Dropdown (раскрывающаяся папка)
 * Обычная папка, НЕ начинающаяся с (group-*
 */
export type DocDropdownNode = BaseNode & {
	type: 'dropdown'
	path: string
	dropdown: 'open' | 'collapsible'
	searchable?: boolean
	children: DocNode[]
}

/**
 * Group (группа)
 * Папка с именем (group-*)
 */
export type DocGroupNode = BaseNode & {
	type: 'group'
	path: string
	description?: string
	children: DocNode[]
}

/**
 * Button (кнопка)
 * Файл: <name>.button.md
 */
export type DocButtonNode = BaseNode & {
	type: 'button'
	variant: 'link' | 'page'
	// Для variant: 'link'
	url?: string
	target?: '_blank' | '_self'
	style?: 'primary' | 'secondary' | 'outline' | 'ghost'
	// Для variant: 'page'
	pagePath?: string
	filePath?: string
}

/**
 * Version (версия документации)
 * Папка верхнего уровня в docs/
 */
export type DocVersionNode = {
	type: 'version'
	version: string
	path: string
	children: DocNode[]
}

/**
 * Объединенный тип узла документации
 */
export type DocNode =
	| DocPageNode
	| DocDropdownNode
	| DocGroupNode
	| DocButtonNode

/**
 * Дерево документации
 * Массив версий
 */
export type DocsTree = DocVersionNode[]
