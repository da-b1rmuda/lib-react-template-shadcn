/// <reference types="vite/client" />
import { useEffect, useMemo, useState } from 'react'

/**
 * Hook for scanning markdown files via import.meta.glob with HMR support
 *
 * @param rootDir - Root directory for scanning (e.g., "/docs")
 *                  Pattern will be built as rootDir + "/*.md"
 * @returns Object with file paths as keys and their content as values
 */
export function useDocsSource(rootDir: string): Record<string, string> {
	// Нормализуем rootDir: убираем начальный и конечный слэши
	const normalizedRootDir = rootDir.replace(/^\/+|\/+$/g, '')
	// Строим паттерн для glob
	// Если rootDir пустой, сканируем все .md файлы
	const globPattern = normalizedRootDir
		? `${normalizedRootDir}/**/*.md`
		: '**/*.md'

	// Используем import.meta.glob для сканирования всех .md файлов
	// as: "raw" - получаем содержимое как строку напрямую
	// eager: true - загружаем все файлы сразу
	// @ts-expect-error - import.meta.glob is available in Vite runtime
	const modules = import.meta.glob<string>(globPattern, {
		as: 'raw',
		eager: true,
	})

	// Преобразуем результат import.meta.glob в Record<string, string>
	const initialFiles = useMemo(() => {
		const files: Record<string, string> = {}
		for (const [path, content] of Object.entries(modules)) {
			// При as: 'raw' content уже является строкой
			files[path] = typeof content === 'string' ? content : ''
		}
		return files
	}, [modules])

	const [files, setFiles] = useState<Record<string, string>>(initialFiles)

	// Подписка на HMR обновления
	useEffect(() => {
		// Проверяем, доступен ли HMR (только в dev режиме)
		// @ts-expect-error - import.meta.hot is available in Vite dev mode
		if (import.meta.hot) {
			// Подписываемся на событие перед обновлением для пересборки файлов
			// Это срабатывает при изменении, добавлении или удалении файлов
			const handleBeforeUpdate = () => {
				// Пересобираем модули с тем же паттерном
				// Vite автоматически обновит кэш модулей
				// @ts-expect-error - import.meta.glob is available in Vite runtime
				const updatedModules = import.meta.glob<string>(globPattern, {
					as: 'raw',
					eager: true,
				})

				const updatedFiles: Record<string, string> = {}
				for (const [path, content] of Object.entries(updatedModules)) {
					updatedFiles[path] = typeof content === 'string' ? content : ''
				}

				setFiles(updatedFiles)
			}

			// @ts-expect-error - import.meta.hot is available in Vite dev mode
			import.meta.hot.on('vite:beforeUpdate', handleBeforeUpdate)

			// Подписываемся на accept для обновления конкретных модулей
			// Принимаем обновления модулей, соответствующих паттерну
			// @ts-expect-error - import.meta.hot is available in Vite dev mode
			import.meta.hot.accept(newModules => {
				if (newModules) {
					// newModules содержит обновленные модули
					// Объединяем их с существующими
					const updatedFiles: Record<string, string> = { ...files }
					for (const [path, content] of Object.entries(newModules)) {
						updatedFiles[path] = typeof content === 'string' ? content : ''
					}
					setFiles(updatedFiles)
				}
			})

			// Очистка подписки при размонтировании
			return () => {
				// @ts-expect-error - import.meta.hot is available in Vite dev mode
				if (import.meta.hot) {
					// @ts-expect-error - import.meta.hot is available in Vite dev mode
					import.meta.hot.off('vite:beforeUpdate', handleBeforeUpdate)
				}
			}
		}
	}, [globPattern, files])

	// Обновляем состояние при изменении initialFiles (например, при изменении rootDir)
	useEffect(() => {
		setFiles(initialFiles)
	}, [initialFiles])

	return files
}
