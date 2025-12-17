/// <reference types="vite/client" />
import { useEffect, useMemo, useState } from 'react'

// ВАЖНО: импортируем markdown-файлы один раз на уровне модуля,
// чтобы объект docsModules не пересоздавался на каждом рендере
// и не вызывал бесконечные обновления состояния.
//
// Используем абсолютный путь `/docs/**/*.md`, чтобы Vite сканировал
// папку docs в корне приложения (template/docs в твоём шаблоне).
// @ts-expect-error - import.meta.glob доступен во время выполнения Vite
const docsModules = import.meta.glob<string>('/docs/**/*.md', {
	as: 'raw',
	eager: true,
})

/**
 * Hook for scanning markdown files via import.meta.glob with HMR support
 *
 * @param rootDir - Root directory for scanning (e.g., "/docs")
 * @returns Object with file paths as keys and their content as values
 */
export function useDocsSource(rootDir: string): Record<string, string> {
	// Нормализуем rootDir: убираем начальный и конечный слэши
	const normalizedRootDir = rootDir.replace(/^\/+|\/+$/g, '')

	const shouldInclude = (path: string) => {
		if (!normalizedRootDir) return true

		// Нормализуем путь:
		// - убираем ./ или ../ в начале
		// - убираем ведущие /, чтобы получать относительный путь вида "docs/..."
		const cleanPath = path.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '')

		// Совпадение корня один-в-один (например "docs")
		if (cleanPath === normalizedRootDir) return true

		// Обычный случай: "docs/..."
		if (cleanPath.startsWith(`${normalizedRootDir}/`)) return true

		// Случай, когда корень вложен (например "src/docs/...")
		return cleanPath.includes(`/${normalizedRootDir}/`)
	}

	// #region agent log
	// Log the result of import.meta.glob to test hypothesis H3 (issue related to specific docs files or rootDir filtering).
	if (typeof window !== 'undefined') {
		fetch('http://127.0.0.1:7243/ingest/3d260573-e526-4f00-b009-095d65decae6', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId: 'debug-session',
				runId: 'pre-fix-1',
				hypothesisId: 'H3',
				location: 'src/docs/useDocsSource.ts:line29',
				message: 'useDocsSource glob result',
				data: {
					rootDir,
					normalizedRootDir,
					modulesCount: Object.keys(docsModules).length,
				},
				timestamp: Date.now(),
			}),
		}).catch(() => {})
	}
	// #endregion

	// Преобразуем результат import.meta.glob в Record<string, string>
	const initialFiles = useMemo(() => {
		const files: Record<string, string> = {}
		for (const [path, content] of Object.entries(docsModules)) {
			if (!shouldInclude(path)) continue

			// При as: 'raw' content уже является строкой
			files[path] = typeof content === 'string' ? content : ''
		}
		return files
	}, [normalizedRootDir])

	const [files, setFiles] = useState<Record<string, string>>(initialFiles)

	// Подписка на HMR обновления
	useEffect(() => {
		// Проверяем, доступен ли HMR (только в dev режиме)
		// @ts-expect-error - import.meta.hot доступен в dev-режиме Vite
		if (import.meta.hot) {
			// Подписываемся на событие перед обновлением для пересборки файлов
			// Это срабатывает при изменении, добавлении или удалении файлов
			const handleBeforeUpdate = () => {
				// Пересобираем модули с тем же фиксированным паттерном
				// Vite автоматически обновит кэш модулей
				// @ts-expect-error - import.meta.glob доступен во время выполнения Vite
				const updatedModules = import.meta.glob<string>('/docs/**/*.md', {
					as: 'raw',
					eager: true,
				})
				const updatedFiles: Record<string, string> = {}
				for (const [path, content] of Object.entries(updatedModules)) {
					if (!shouldInclude(path)) continue
					updatedFiles[path] = typeof content === 'string' ? content : ''
				}

				setFiles(updatedFiles)
			}

			// @ts-expect-error - import.meta.hot is available in Vite dev mode
			import.meta.hot.on('vite:beforeUpdate', handleBeforeUpdate)

			// Подписываемся на accept для обновления конкретных модулей
			// Принимаем обновления модулей, соответствующих паттерну
			// @ts-expect-error - import.meta.hot доступен в dev-режиме Vite
			import.meta.hot.accept(newModules => {
				if (newModules) {
					// newModules содержит обновленные модули
					// Объединяем их с существующими
					const updatedFiles: Record<string, string> = { ...files }
					for (const [path, content] of Object.entries(newModules)) {
						if (!shouldInclude(path)) continue
						updatedFiles[path] = typeof content === 'string' ? content : ''
					}
					setFiles(updatedFiles)
				}
			})

			// Очистка подписки при размонтировании
			return () => {
				// @ts-expect-error - import.meta.hot доступен в dev-режиме Vite
				if (import.meta.hot) {
					// @ts-expect-error - import.meta.hot доступен в dev-режиме Vite
					import.meta.hot.off('vite:beforeUpdate', handleBeforeUpdate)
				}
			}
		}
	}, [files, normalizedRootDir])

	// Обновляем состояние при изменении initialFiles (например, при изменении rootDir)
	useEffect(() => {
		setFiles(initialFiles)
	}, [initialFiles])

	return files
}
