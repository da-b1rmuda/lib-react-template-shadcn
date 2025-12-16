import matter from 'gray-matter'

/**
 * Тип результата парсинга файла документации
 */
export type ParsedDoc =
	| {
			type: 'page'
			meta: Record<string, unknown>
			content: string
	  }
	| {
			type: 'button'
			meta: Record<string, unknown>
			content?: string
	  }
	| {
			type: 'dropdownSettings'
			meta: Record<string, unknown>
			content?: string
	  }
	| {
			type: 'groupSettings'
			meta: Record<string, unknown>
			content?: string
	  }

/**
 * Определяет тип файла на основе его пути
 */
function getFileType(path: string): 'page' | 'button' | 'dropdownSettings' | 'groupSettings' {
	const fileName = path.split('/').pop() || ''
	const lowerFileName = fileName.toLowerCase()

	// Проверяем на button файлы (*.button.md)
	if (lowerFileName.endsWith('.button.md') || lowerFileName.endsWith('.button')) {
		return 'button'
	}

	// Проверяем на settings файлы
	if (lowerFileName === 'dropdown-settings.md' || lowerFileName === 'dropdown-settings') {
		return 'dropdownSettings'
	}

	if (lowerFileName === 'group-settings.md' || lowerFileName === 'group-settings') {
		return 'groupSettings'
	}

	// По умолчанию - обычная страница
	return 'page'
}

/**
 * Парсит markdown файл с frontmatter
 *
 * @param path - Путь к файлу
 * @param content - Содержимое файла (raw markdown с frontmatter)
 * @returns Распарсенный файл с типом, метаданными и контентом
 *
 * @example
 * ```ts
 * const parsed = parseDocFile('/docs/1.0.0/api/auth.md', '---\ntitle: Auth\n---\n# Auth content')
 * // { type: 'page', meta: { title: 'Auth' }, content: '# Auth content' }
 * ```
 */
export function parseDocFile(path: string, content: string): ParsedDoc {
	const fileType = getFileType(path)

	// Парсим frontmatter и контент через gray-matter
	const parsed = matter(content)

	// Извлекаем метаданные из frontmatter
	const meta: Record<string, unknown> = parsed.data || {}

	// Базовый результат
	const baseResult = {
		meta,
	}

	// В зависимости от типа файла возвращаем соответствующий результат
	switch (fileType) {
		case 'button':
			return {
				...baseResult,
				type: 'button' as const,
				// Для кнопок контент опционален
				content: parsed.content.trim() || undefined,
			}

		case 'dropdownSettings':
			return {
				...baseResult,
				type: 'dropdownSettings' as const,
				// Для settings файлов контент опционален
				content: parsed.content.trim() || undefined,
			}

		case 'groupSettings':
			return {
				...baseResult,
				type: 'groupSettings' as const,
				// Для settings файлов контент опционален
				content: parsed.content.trim() || undefined,
			}

		case 'page':
		default:
			return {
				...baseResult,
				type: 'page' as const,
				// Для страниц контент обязателен
				content: parsed.content.trim(),
			}
	}
}

