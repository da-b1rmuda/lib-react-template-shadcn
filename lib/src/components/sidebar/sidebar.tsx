import { Boxes } from 'lucide-react'
import * as React from 'react'

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSubButton,
	SidebarMenuSub,
} from '@/components/ui/sidebar'
import { DocumentationProps } from '../types/DocumentationProps'
import { DocsTree, DocVersionNode, DocNode, DocPageNode } from '@/docs/types'
import { buildSearchIndex, SearchResult } from '@/docs/search'
import { renderDocNode } from './doc-node-renderer'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> &
	DocumentationProps & {
		tree?: DocsTree
		currentVersion?: DocVersionNode | null
		onPageSelect?: (page: DocPageNode) => void
		selectedPage?: DocPageNode | null
		icons?: Record<string, React.ComponentType<{ className?: string }>>
		/**
		 * Контролируемое значение выбранной версии.
		 * Если не задано, компонент управляет версией локально.
		 */
		selectedVersion?: string
		onVersionChange?: (version: string) => void
		/**
		 * Список доступных языков и текущее значение.
		 * Если не переданы, переключатель языка не отображается.
		 */
		languages?: string[]
		selectedLanguage?: string
		onLanguageChange?: (lang: string) => void
	}

export function AppSidebar({
	title = 'Documentation',
	logo = <Boxes className='size-4' />,
	tree = [],
	currentVersion,
	onPageSelect,
	selectedPage,
	icons,
	selectedVersion: selectedVersionProp,
	onVersionChange,
	languages,
	selectedLanguage,
	onLanguageChange,
	...props
}: AppSidebarProps) {
	const versions = tree.map(v => v.version)

	// Неконтролируемое состояние версии для обратной совместимости
	const [uncontrolledVersion, setUncontrolledVersion] = React.useState(
		selectedVersionProp || currentVersion?.version || versions[0] || ''
	)

	const selectedVersion =
		selectedVersionProp !== undefined ? selectedVersionProp : uncontrolledVersion

	const handleVersionChange = (value: string) => {
		if (selectedVersionProp === undefined) {
			setUncontrolledVersion(value)
		}
		onVersionChange?.(value)
	}

	// Находим выбранную версию
	const activeVersion =
		tree.find(v => v.version === selectedVersion) || currentVersion || null

	// Собираем все страницы из активной версии для поиска по pagePath
	const allPages = React.useMemo(() => {
		if (!activeVersion) return []
		const collectPages = (nodes: DocNode[]): DocPageNode[] => {
			const pages: DocPageNode[] = []
			for (const node of nodes) {
				if (node.type === 'page') {
					pages.push(node)
				}
				if ('children' in node && node.children) {
					pages.push(...collectPages(node.children))
				}
			}
			return pages
		}
		return collectPages(activeVersion.children)
	}, [activeVersion])

	// Построение поискового индекса по текущей версии (и языку)
	const { search } = React.useMemo(
		() => buildSearchIndex(activeVersion ? [activeVersion] : []),
		[activeVersion]
	)

	const [searchQuery, setSearchQuery] = React.useState('')
	const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])

	// Выполняем поиск при смене запроса
	React.useEffect(() => {
		if (!searchQuery.trim()) {
			setSearchResults([])
			return
		}
		setSearchResults(search(searchQuery))
	}, [search, searchQuery])

	const hasLanguages = languages && languages.length > 0

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className='flex items-center gap-3 px-2 py-2'>
					<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
						{logo}
					</div>
					<span className='font-semibold'>{title}</span>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Documentation</SidebarGroupLabel>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton disabled size='sm' variant='outline'>
								<span className='text-xs text-muted-foreground'>
									Sidebar content is temporarily simplified.
								</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
