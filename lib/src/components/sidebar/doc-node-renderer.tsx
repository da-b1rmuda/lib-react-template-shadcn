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

type DocNodeRendererProps = {
	node: DocNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
}

function DocPageRenderer({
	node,
	selectedPage,
	onPageSelect,
}: {
	node: DocPageNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
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
					{node.title}
				</a>
			</SidebarMenuSubButton>
		</SidebarMenuItem>
	)
}

function DocButtonRenderer({ node }: { node: DocButtonNode }) {
	if (node.variant === 'link') {
		return (
			<SidebarMenuItem key={node.id}>
				<SidebarMenuButton asChild>
					<a
						href={node.url || '#'}
						target={node.target}
						rel={node.target === '_blank' ? 'noopener noreferrer' : undefined}
					>
						{node.icon && <span>{node.icon}</span>}
						<span>{node.title}</span>
					</a>
				</SidebarMenuButton>
			</SidebarMenuItem>
		)
	}
	return null
}

function DocDropdownRenderer({
	node,
	selectedPage,
	onPageSelect,
}: {
	node: DocDropdownNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
}) {
	const [isOpen, setIsOpen] = React.useState(node.dropdown === 'open')

	return (
		<SidebarMenuItem key={node.id}>
			<SidebarMenuButton
				onClick={() => setIsOpen(!isOpen)}
				data-state={isOpen ? 'open' : 'closed'}
			>
				{node.icon && <span>{node.icon}</span>}
				<span>{node.title}</span>
			</SidebarMenuButton>
			{isOpen && node.children.length > 0 && (
				<SidebarMenuSub>
					{node.children.map(child =>
						renderDocNode(child, selectedPage, onPageSelect)
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
}: {
	node: DocGroupNode
	selectedPage: DocPageNode | null
	onPageSelect?: (page: DocPageNode) => void
}) {
	return (
		<SidebarGroup key={node.id}>
			{node.title && (
				<SidebarGroupLabel className='px-2 py-1.5'>
					{node.icon && <span className='mr-2'>{node.icon}</span>}
					{node.title}
				</SidebarGroupLabel>
			)}
			{node.children.length > 0 && (
				<SidebarMenu>
					{node.children.map(child =>
						renderDocNode(child, selectedPage, onPageSelect)
					)}
				</SidebarMenu>
			)}
		</SidebarGroup>
	)
}

export function renderDocNode(
	node: DocNode,
	selectedPage: DocPageNode | null,
	onPageSelect?: (page: DocPageNode) => void
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
				/>
			)

		case 'button':
			return <DocButtonRenderer node={node} />

		case 'dropdown':
			return (
				<DocDropdownRenderer
					node={node}
					selectedPage={selectedPage}
					onPageSelect={onPageSelect}
				/>
			)

		case 'group':
			return (
				<DocGroupRenderer
					node={node}
					selectedPage={selectedPage}
					onPageSelect={onPageSelect}
				/>
			)

		default:
			return null
	}
}

