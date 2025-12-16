import { useMemo, useState } from 'react'
import * as React from 'react'
import { AppSidebar } from '@/components/sidebar/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Separator } from '@/components/ui/separator'
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from '@/components/ui/sidebar'
import { DocumentationProps } from '../types/DocumentationProps'
import { useDocsSource } from '@/docs/useDocsSource'
import { buildDocsTree } from '@/docs/buildDocsTree'
import { DocsTree, DocPageNode, DocNode } from '@/docs/types'
import { DocContent } from './doc-content'

export function Documentation({
	title,
	useToggleTheme = false,
	logo,
	rootDir = '/docs',
	icons,
}: DocumentationProps) {
	// Загружаем файлы документации
	const files = useDocsSource(rootDir)

	// Строим дерево документации
	const tree = useMemo<DocsTree>(() => {
		try {
			return buildDocsTree(files)
		} catch (error) {
			console.error('Error building docs tree:', error)
			return []
		}
	}, [files])

	// Состояние для выбранной страницы
	const [selectedPage, setSelectedPage] = useState<DocPageNode | null>(null)

	// Определяем текущую версию (первая в списке)
	const currentVersion = tree.length > 0 ? tree[0] : null

	// Находим первую страницу для автоматического выбора
	const findFirstPage = (nodes: DocNode[]): DocPageNode | null => {
		for (const node of nodes) {
			if (node.type === 'page' && !node.hidden) {
				return node
			}
			if ('children' in node && node.children) {
				const found = findFirstPage(node.children)
				if (found) return found
			}
		}
		return null
	}

	// Автоматически выбираем первую страницу при загрузке
	React.useEffect(() => {
		if (!selectedPage && currentVersion) {
			const firstPage = findFirstPage(currentVersion.children)
			if (firstPage) {
				setSelectedPage(firstPage)
			}
		}
	}, [currentVersion, selectedPage])

	// Состояния
	const isLoading = Object.keys(files).length === 0 && tree.length === 0
	const isEmpty = tree.length === 0 && Object.keys(files).length > 0
	const hasError = false // Можно добавить обработку ошибок

	return (
		<SidebarProvider>
			<AppSidebar
				title={title}
				logo={logo}
				tree={tree}
				currentVersion={currentVersion}
				onPageSelect={setSelectedPage}
				selectedPage={selectedPage}
				icons={icons}
			/>
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-3'>
					<div className='flex items-center gap-2'>
						<SidebarTrigger />
						<Separator orientation='vertical' className='mr-2 h-4' />
					</div>
					{useToggleTheme && <ThemeToggle />}
				</header>
				<div className='flex flex-1 flex-col gap-4 p-4'>
					{isLoading && (
						<div className='flex items-center justify-center min-h-[400px]'>
							<div className='text-muted-foreground'>Loading documentation...</div>
						</div>
					)}
					{isEmpty && (
						<div className='flex items-center justify-center min-h-[400px]'>
							<div className='text-muted-foreground'>
								No documentation found. Please add markdown files to {rootDir}
							</div>
						</div>
					)}
					{hasError && (
						<div className='flex items-center justify-center min-h-[400px]'>
							<div className='text-destructive'>
								Error loading documentation. Please check the console.
							</div>
						</div>
					)}
					{!isLoading && !isEmpty && !hasError && (
						<DocContent page={selectedPage} />
					)}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
