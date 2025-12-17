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

	// Построение поискового индекса по текущему дереву
	const { search } = React.useMemo(() => buildSearchIndex(tree), [tree])

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
				<div className='flex flex-col gap-2 px-2 py-2'>
					<div className='flex items-center justify-between gap-2'>
					<a
						href='/'
						className='flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'
					>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							{logo}
						</div>
						<span className='font-semibold'>{title}</span>
					</a>
					<div className='flex items-center gap-2'>
						{hasLanguages && selectedLanguage !== undefined && onLanguageChange && (
							<Select
								value={selectedLanguage}
								onValueChange={onLanguageChange}
							>
								<SelectTrigger className='h-6 w-auto min-w-16 border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent shadow-none focus:ring-0 focus:ring-offset-0 p-0 px-2 text-xs'>
									<SelectValue placeholder='Lang' />
								</SelectTrigger>
								<SelectContent>
									{languages!.map(lang => (
										<SelectItem key={lang} value={lang}>
											{lang.toUpperCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
						{versions.length > 0 && (
							<Select
								value={selectedVersion}
								onValueChange={handleVersionChange}
							>
								<SelectTrigger className='h-6 w-auto min-w-16 border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent shadow-none focus:ring-0 focus:ring-offset-0 p-0 px-2 text-xs'>
									<SelectValue placeholder='Version' />
								</SelectTrigger>
								<SelectContent>
									{versions.map(version => (
										<SelectItem key={version} value={version}>
											{version}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>
					<SidebarInput
						placeholder='Search documentation...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='mt-1'
					/>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{searchQuery.trim() && searchResults.length > 0 ? (
					<SidebarGroup>
						<SidebarGroupLabel>Search results</SidebarGroupLabel>
						<SidebarMenu>
							{searchResults.map(result => {
								// Ищем реальную страницу по id в активной версии (если есть)
								const targetPage =
									allPages.find(p => p.id === result.doc.id) || null

								if (!targetPage) return null

								return (
									<SidebarMenuItem key={result.doc.id}>
										<SidebarMenuButton
											onClick={() => {
												onPageSelect?.(targetPage)
												// также переключаем версию, если нужно
												if (
													onVersionChange &&
													result.doc.version !== selectedVersion
												) {
													onVersionChange(result.doc.version)
												}
											}}
											variant='outline'
											size='sm'
										>
											<span className='flex flex-col items-start'>
												<span className='text-xs font-medium'>
													{result.doc.title}
												</span>
												<span className='text-[10px] text-sidebar-foreground/60'>
													{result.doc.version}
													{result.doc.lang ? ` · ${result.doc.lang}` : ''}
												</span>
											</span>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroup>
				) : searchQuery.trim() && searchResults.length === 0 ? (
					<SidebarGroup>
						<SidebarGroupLabel>No results</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<div className='px-2 py-1.5 text-sm text-muted-foreground'>
									Nothing found for “{searchQuery}”
								</div>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				) : activeVersion && activeVersion.children.length > 0 ? (
					activeVersion.children.map(node =>
						renderDocNode(node, selectedPage, onPageSelect, icons, allPages)
					)
				) : (
					<SidebarGroup>
						<SidebarGroupLabel>No documentation</SidebarGroupLabel>
						<SidebarMenu>
							<SidebarMenuItem>
								<div className='px-2 py-1.5 text-sm text-muted-foreground'>
									Add markdown files to get started
								</div>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				)}
			</SidebarContent>
		</Sidebar>
	)
}
