import {
	Book,
	Box,
	Boxes,
	Code,
	GraduationCap,
	MessageCircle,
	Package,
} from 'lucide-react'
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
} from '@/components/ui/sidebar'

// Main navigation items
const mainNavItems = [
	{ title: 'Documentation', icon: Book, url: '#', isActive: true },
	{ title: 'Components', icon: Boxes, url: '#' },
	{ title: 'Templates', icon: Package, url: '#' },
	{ title: 'UI Kit', icon: Box, url: '#' },
	{ title: 'Playground', icon: Code, url: '#' },
	{ title: 'Course', icon: GraduationCap, url: '#' },
	{ title: 'Community', icon: MessageCircle, url: '#' },
]

// Getting Started section items
const gettingStartedItems = [
	{ title: 'Installation', url: '#', isActive: true },
	{ title: 'Editor setup', url: '#' },
	{ title: 'Compatibility', url: '#' },
	{ title: 'Upgrade guide', url: '#' },
]

const versions = ['v1.0.0', 'v0.9.0', 'v0.8.0']

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const [selectedVersion, setSelectedVersion] = React.useState(versions[0])

	return (
		<Sidebar {...props}>
			<SidebarHeader>
				<div className='flex items-center justify-between gap-2 px-2 py-2'>
					<a
						href='/'
						className='flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'
					>
						<div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
							<Boxes className='size-4' />
						</div>
						<span className='font-semibold'>dock-rush</span>
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
				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarMenu>
						{mainNavItems.map(item => {
							const Icon = item.icon
							return (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={item.isActive}>
										<a href={item.url}>
											<Icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)
						})}
					</SidebarMenu>
				</SidebarGroup>

				{/* Getting Started Section */}
				<SidebarGroup>
					<SidebarGroupLabel>GETTING STARTED</SidebarGroupLabel>
					<SidebarMenu>
						{gettingStartedItems.map(item => (
							<SidebarMenuItem key={item.title}>
								<SidebarMenuSubButton
									asChild
									isActive={item.isActive}
									className='relative pl-3 before:absolute before:left-0 before:top-0 before:h-full before:w-0.5 before:rounded-r before:bg-sidebar-border data-[active=true]:before:bg-sidebar-accent-foreground'
								>
									<a href={item.url}>{item.title}</a>
								</SidebarMenuSubButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
