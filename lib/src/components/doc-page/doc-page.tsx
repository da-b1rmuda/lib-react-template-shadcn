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

	// Строим полное дерево документации (все версии и языки)
	const fullTree = useMemo<DocsTree>(() => {
		try {
			return buildDocsTree(files)
		} catch (error) {
			console.error('Error building docs tree:', error)
			return []
		}
	}, [files])

	// Список доступных версий
	const versionList = useMemo(
		() => fullTree.map(version => version.version),
		[fullTree]
	)

	// Текущая выбранная версия
	const [selectedVersion, setSelectedVersion] = useState<string | null>(null)

	// Список доступных языков (из всех страниц)
	const allLanguages = useMemo(() => {
		const langs = new Set<string>()

		const collectLanguages = (nodes: DocNode[]) => {
			for (const node of nodes) {
				if (node.type === 'page' && node.lang) {
					langs.add(node.lang)
				}
				if ('children' in node && node.children) {
					collectLanguages(node.children)
				}
			}
		}

		for (const version of fullTree) {
			collectLanguages(version.children)
		}

		return Array.from(langs).sort()
	}, [fullTree])

	const [selectedLanguage, setSelectedLanguage] = useState<string>('')

	// Синхронизируем выбранную версию с доступными
	React.useEffect(() => {
		if (versionList.length === 0) {
			if (selectedVersion !== null) {
				setSelectedVersion(null)
			}
			return
		}

		if (!selectedVersion || !versionList.includes(selectedVersion)) {
			setSelectedVersion(versionList[0] || null)
		}
	}, [versionList, selectedVersion])

	// Синхронизируем выбранный язык с доступными
	React.useEffect(() => {
		if (allLanguages.length === 0) {
			// Нет языков — сбрасываем выбор
			if (selectedLanguage !== '') {
				setSelectedLanguage('')
			}
			return
		}

		if (!selectedLanguage || !allLanguages.includes(selectedLanguage)) {
			setSelectedLanguage(allLanguages[0])
		}
	}, [allLanguages, selectedLanguage])

	// Фильтрация дерева по языку (если языки присутствуют)
	const tree = useMemo<DocsTree>(() => {
		if (allLanguages.length === 0 || !selectedLanguage) {
			return fullTree
		}

		const filterNodesByLanguage = (nodes: DocNode[]): DocNode[] => {
			const result: DocNode[] = []

			for (const node of nodes) {
				if (node.type === 'page') {
					// Страницы без lang считаем общими для всех языков
					if (!node.lang || node.lang === selectedLanguage) {
						result.push(node)
					}
					continue
				}

				if ('children' in node && node.children) {
					const filteredChildren = filterNodesByLanguage(node.children)
					if (filteredChildren.length > 0) {
						// Сохраняем структуру, но подставляем отфильтрованных детей
						result.push({ ...node, children: filteredChildren } as DocNode)
					}
					continue
				}

				// Кнопки и прочие узлы без детей оставляем как есть
				result.push(node)
			}

			return result
		}

		return fullTree
			.map(version => ({
				...version,
				children: filterNodesByLanguage(version.children),
			}))
			.filter(version => version.children.length > 0)
	}, [fullTree, allLanguages.length, selectedLanguage])

	// Состояние для выбранной страницы
	const [selectedPage, setSelectedPage] = useState<DocPageNode | null>(null)

	// Определяем текущую версию (выбранная или первая)
	const currentVersion =
		tree.find(v => (selectedVersion ? v.version === selectedVersion : true)) ||
		tree[0] ||
		null

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

	// Сбрасываем выбранную страницу при смене версии или языка,
	// чтобы автоматически выбрать актуальную страницу
	React.useEffect(() => {
		setSelectedPage(null)
	}, [selectedVersion, selectedLanguage])

	// Автоматически выбираем первую страницу при загрузке / смене версии или языка
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
				selectedVersion={selectedVersion || undefined}
				onVersionChange={setSelectedVersion}
				languages={allLanguages}
				selectedLanguage={selectedLanguage || undefined}
				onLanguageChange={setSelectedLanguage}
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
