import * as React from 'react'
import {
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSubButton,
	SidebarMenuSub,
	SidebarGroupLabel,
	SidebarGroup,
	SidebarMenu,
} from '@/components/ui/sidebar'
import {
	DocNode,
	DocPageNode,
	DocDropdownNode,
	DocGroupNode,
	DocButtonNode,
} from '@/docs/types'

type IconMap = Record<string, React.ComponentType<{ className?: string }>>

/**
 * Рендерит иконку с fallback
 */
function renderIcon(
	iconName: string | undefined,
	icons?: IconMap,
	className?: string
): React.ReactNode {
	if (!iconName) {
		return null
	}

	const IconComponent = icons?.[iconName]

	if (IconComponent) {
		return <IconComponent className={className || 'size-4'} />
	}

	// Fallback: если иконка не найдена, возвращаем null
	return null
}

function DocPageRenderer({
	node,
	selectedPage,
	onPageSelect,
	icons,
}: {
	node: DocPageNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
	icons?: IconMap
}) {
	return (
		<SidebarMenuItem key={node.id}>
			<SidebarMenuSubButton
				asChild
				isActive={selectedPage?.id === node.id}
				className='relative pl-3 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-r before:bg-sidebar-border data-[active=true]:before:bg-sidebar-accent-foreground'
				onClick={() => onPageSelect?.(node)}
			>
				<a href='#' onClick={e => e.preventDefault()}>
					{renderIcon(node.icon, icons)}
					<span>{node.title}</span>
				</a>
			</SidebarMenuSubButton>
		</SidebarMenuItem>
	)
}

function DocButtonRenderer({
	node,
	onPageSelect,
	allPages,
	icons,
}: {
	node: DocButtonNode
	onPageSelect?: (page: DocPageNode) => void
	allPages?: DocPageNode[]
	icons?: IconMap
}) {
	if (node.variant === 'link') {
		return (
			<SidebarMenuItem key={node.id}>
				<SidebarMenuButton asChild>
					<a
						href={node.url || '#'}
						target={node.target}
						rel={node.target === '_blank' ? 'noopener noreferrer' : undefined}
					>
						{renderIcon(node.icon, icons)}
						<span>{node.title}</span>
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		)
	}

	// variant: 'page' - открывает страницу по pagePath
	if (node.variant === 'page' && node.pagePath && allPages) {
		const targetPage = allPages.find(p => p.path === node.pagePath)
		if (targetPage) {
			return (
				<SidebarMenuItem key={node.id}>
					<SidebarMenuButton
						onClick={() => onPageSelect?.(targetPage)}
						variant={node.style || 'default'}
					>
						{renderIcon(node.icon, icons)}
						<span>{node.title}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			)
		}
	}

	return null
}

function DocDropdownRenderer({
	node,
	selectedPage,
	onPageSelect,
	icons,
	allPages,
}: {
	node: DocDropdownNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
	icons?: IconMap
	allPages?: DocPageNode[]
}) {
	const [isOpen, setIsOpen] = React.useState(node.dropdown === 'open')

	return (
		<SidebarMenuItem key={node.id}>
			<SidebarMenuButton
				onClick={() => setIsOpen(!isOpen)}
				data-state={isOpen ? 'open' : 'closed'}
			>
				{renderIcon(node.icon, icons)}
				<span>{node.title}</span>
			</SidebarMenuButton>
			{isOpen && node.children.length > 0 && (
				<SidebarMenuSub>
					{node.children.map(child =>
						renderDocNode(child, selectedPage, onPageSelect, icons, allPages)
					)}
				</SidebarMenuSub>
			)}
		</SidebarMenuItem>
	)
}

function DocGroupRenderer({
	node,
	selectedPage,
	onPageSelect,
	icons,
	allPages,
}: {
	node: DocGroupNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
	icons?: IconMap
	allPages?: DocPageNode[]
}) {
	return (
		<SidebarGroup key={node.id}>
			{node.title && (
				<SidebarGroupLabel className='px-2 py-1.5'>
					{renderIcon(node.icon, icons, 'size-4 mr-2')}
					{node.title}
				</SidebarGroupLabel>
			)}
			{node.children.length > 0 && (
				<SidebarMenu>
					{node.children.map(child =>
						renderDocNode(child, selectedPage, onPageSelect, icons, allPages)
					)}
				</SidebarMenu>
			)}
		</SidebarGroup>
	)
}

/**
 * Собирает все страницы из дерева для поиска по pagePath
 */
function collectAllPages(nodes: DocNode[]): DocPageNode[] {
	const pages: DocPageNode[] = []
	for (const node of nodes) {
		if (node.type === 'page') {
			pages.push(node)
		}
		if ('children' in node && node.children) {
			pages.push(...collectAllPages(node.children))
		}
	}
	return pages
}

export function renderDocNode(
	node: DocNode,
	selectedPage: DocPageNode | null,
	onPageSelect?: (page: DocPageNode) => void,
	icons?: IconMap,
	allPages?: DocPageNode[]
): React.ReactNode {
	// Пропускаем скрытые узлы
	if (node.hidden) {
		return null
	}

	switch (node.type) {
		case 'page':
			return (
				<DocPageRenderer
					node={node}
					selectedPage={selectedPage}
					onPageSelect={onPageSelect}
					icons={icons}
				/>
			)

		case 'button':
			return (
				<DocButtonRenderer
					node={node}
					onPageSelect={onPageSelect}
					allPages={allPages}
					icons={icons}
				/>
			)

		case 'dropdown':
			return (
				<DocDropdownRenderer
					node={node}
					selectedPage={selectedPage}
					onPageSelect={onPageSelect}
					icons={icons}
					allPages={allPages}
				/>
			)

		case 'group':
			return (
				<DocGroupRenderer
					node={node}
					selectedPage={selectedPage}
					onPageSelect={onPageSelect}
					icons={icons}
					allPages={allPages}
				/>
			)

		default:
			return null
	}
}

