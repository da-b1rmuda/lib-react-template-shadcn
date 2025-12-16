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
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSubButton,
	SidebarMenuSub,
} from '@/components/ui/sidebar'
import { DocumentationProps } from '../types/DocumentationProps'
import { DocsTree, DocVersionNode, DocNode, DocPageNode } from '@/docs/types'
import { renderDocNode } from './doc-node-renderer'

type AppSidebarProps = React.ComponentProps<typeof Sidebar> &
	DocumentationProps & {
		tree?: DocsTree
		currentVersion?: DocVersionNode | null
		onPageSelect?: (page: DocPageNode) => void
		selectedPage?: DocPageNode | null
	}

export function AppSidebar({
	title = 'Documentation',
	logo = <Boxes className='size-4' />,
	tree = [],
	currentVersion,
	onPageSelect,
	selectedPage,
	...props
}: AppSidebarProps) {
	const versions = tree.map(v => v.version)
	const [selectedVersion, setSelectedVersion] = React.useState(
		currentVersion?.version || versions[0] || ''
	)

	// Находим выбранную версию
	const activeVersion =
		tree.find(v => v.version === selectedVersion) || currentVersion || null

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className='flex items-center justify-between gap-2 px-2 py-2'>
					<a
						href='/'
						className='flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'
					>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							{logo}
						</div>
						<span className='font-semibold'>{title}</span>
					</a>
					<Select value={selectedVersion} onValueChange={setSelectedVersion}>
						<SelectTrigger className='h-6 w-auto min-w-16 border border-sidebar-border bg-sidebar-accent/50 hover:bg-sidebar-accent shadow-none focus:ring-0 focus:ring-offset-0 p-0 px-2 text-xs'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{versions.map(version => (
								<SelectItem key={version} value={version}>
									{version}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</SidebarHeader>
			<SidebarContent>
				{activeVersion && activeVersion.children.length > 0 ? (
					activeVersion.children.map(node =>
						renderDocNode(node, selectedPage, onPageSelect)
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
