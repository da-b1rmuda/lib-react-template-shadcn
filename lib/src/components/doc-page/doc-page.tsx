import { AppSidebar } from '@/components/sidebar/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { DocumentationProps } from '../types/DocumentationProps'
export function Documentation({
	title,
	useToggleTheme = false,
	logo,
}: DocumentationProps) {
	return (
		<SidebarProvider>
			<AppSidebar title={title} logo={logo} />
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3'>
					<div className='flex items-center gap-2'>
						<SidebarTrigger />
						<Separator orientation='vertical' className='mr-2 h-4' />
					</div>
					{useToggleTheme && <ThemeToggle />}
				</header>
				<div className='flex flex-1 flex-col gap-4 p-4'>
					<div className='grid auto-rows-min gap-4 md:grid-cols-3'>
						<div className='bg-muted/50 aspect-video rounded-xl' />
						<div className='bg-muted/50 aspect-video rounded-xl' />
						<div className='bg-muted/50 aspect-video rounded-xl' />
					</div>
					<div className='bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min' />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
