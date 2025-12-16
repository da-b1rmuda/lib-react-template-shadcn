<<<<<<< HEAD
export type ThemeMode = 'light' | 'dark' | 'system'

// Lightweight local representation of MDX components map.
// We avoid importing types from '@mdx-js/react' to support multiple MDX versions.
export type MdxComponents = Record<string, React.ComponentType<any>>

=======
>>>>>>> 9cfb902 (Enhance Documentation and AppSidebar components to accept title and logo props, and conditionally render ThemeToggle based on useToggleTheme prop.)
export type DocumentationProps = {
	title?: string
	useToggleTheme?: boolean
	logo?: React.ReactNode
<<<<<<< HEAD
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
=======
>>>>>>> 9cfb902 (Enhance Documentation and AppSidebar components to accept title and logo props, and conditionally render ThemeToggle based on useToggleTheme prop.)
}
