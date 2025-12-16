import { DocsTree } from '@/docs/types'

export type DocumentationProps = {
	title?: string
	useToggleTheme?: boolean
	logo?: React.ReactNode
	rootDir?: string
	icons?: Record<string, React.ComponentType<{ className?: string }>>
}
