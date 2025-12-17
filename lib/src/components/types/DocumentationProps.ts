export type ThemeMode = 'light' | 'dark' | 'system'

// Lightweight local representation of MDX components map.
// We avoid importing types from '@mdx-js/react' to support multiple MDX versions.
export type MdxComponents = Record<string, React.ComponentType<any>>

export type DocumentationProps = {
	title?: string
	useToggleTheme?: boolean
	logo?: React.ReactNode
	rootDir?: string
	icons?: Record<string, React.ComponentType<{ className?: string }>>
	/**
	 * Начальный режим темы для переключателя.
	 * Если не задан, будет использован saved в localStorage или system.
	 */
	initialTheme?: ThemeMode
	/**
	 * Карта MDX-компонентов, доступных внутри markdown/MDX контента.
	 */
	mdxComponents?: MdxComponents
}
