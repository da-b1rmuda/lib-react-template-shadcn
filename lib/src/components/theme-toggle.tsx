import { Moon, Sun } from 'lucide-react'
import * as React from 'react'
import { Button } from './ui/button'
import type { ThemeMode } from '../types/DocumentationProps'

type ThemeToggleProps = {
	initialMode?: ThemeMode
}

export function ThemeToggle({ initialMode }: ThemeToggleProps) {
	const getInitialMode = (): ThemeMode => {
		if (typeof window === 'undefined') return initialMode ?? 'system'
		const stored = window.localStorage.getItem('theme')
		if (stored === 'light' || stored === 'dark' || stored === 'system') {
			return stored
		}
		return initialMode ?? 'system'
	}

	const getSystemPrefersDark = () => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return false
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches
	}

	const [mode, setMode] = React.useState<ThemeMode>(getInitialMode)
	const [systemPrefersDark, setSystemPrefersDark] = React.useState<boolean>(
		getSystemPrefersDark
	)

	// Следим за системной темой
	React.useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return
		}

		const mql = window.matchMedia('(prefers-color-scheme: dark)')
		const handleChange = (event: MediaQueryListEvent) => {
			setSystemPrefersDark(event.matches)
		}

		setSystemPrefersDark(mql.matches)
		mql.addEventListener('change', handleChange)

		return () => {
			mql.removeEventListener('change', handleChange)
		}
	}, [])

	// Вычисляем фактическую тему (light/dark) с учетом system
	const effectiveTheme: 'light' | 'dark' =
		mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode

	// Применяем класс темы и сохраняем выбранный режим
	React.useEffect(() => {
		if (typeof document === 'undefined') return

		const root = document.documentElement
		if (effectiveTheme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}

		if (typeof window !== 'undefined') {
			window.localStorage.setItem('theme', mode)
		}
	}, [effectiveTheme, mode])

	// Циклическое переключение режима: light -> dark -> system -> light ...
	const cycleMode = () => {
		setMode(prev =>
			prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'
		)
	}

	return (
		<Button
			variant='ghost'
			size='icon'
			onClick={cycleMode}
			className='h-9 w-9'
			aria-label='Toggle theme'
		>
			<Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
			<Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
			<span className='sr-only'>Toggle theme</span>
		</Button>
	)
}

