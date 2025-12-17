import * as React from 'react'
import { DocPageNode } from '@/docs/types'
import type { MdxComponents } from '../types/DocumentationProps'

// #region agent log
// Log module initialization to test hypothesis H1 (whether this module is loaded before any crash).
if (typeof window !== 'undefined') {
	fetch('http://127.0.0.1:7243/ingest/3d260573-e526-4f00-b009-095d65decae6', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			sessionId: 'debug-session',
			runId: 'pre-fix-2',
			hypothesisId: 'H1',
			location: 'src/components/doc-page/doc-content.tsx:module',
			message: 'DocContent module loaded (no MDX runtime import)',
			data: {},
			timestamp: Date.now(),
		}),
	}).catch(() => {})
}
// #endregion

type DocContentProps = {
	page: DocPageNode | null
	components?: MdxComponents
}

export function DocContent({ page, components }: DocContentProps) {
	// #region agent log
	// Log entry into DocContent to test hypothesis H2 (error during MDX evaluation of page.content).
	if (typeof window !== 'undefined') {
		fetch('http://127.0.0.1:7243/ingest/3d260573-e526-4f00-b009-095d65decae6', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				sessionId: 'debug-session',
				runId: 'pre-fix-2',
				hypothesisId: 'H2',
				location: 'src/components/doc-page/doc-content.tsx:line12',
				message: 'DocContent render start',
				data: {
					hasPage: !!page,
					pageId: page?.id ?? null,
					hasContent: !!page?.content,
				},
				timestamp: Date.now(),
			}),
		}).catch(() => {})
	}
	// #endregion

	if (!page) {
		return (
			<div className='flex items-center justify-center min-h-[400px]'>
				<div className='text-muted-foreground'>
					Select a page from the sidebar to view its content
				</div>
			</div>
		)
	}

	return (
		<div className='prose prose-slate dark:prose-invert max-w-none'>
			<h1>{page.title}</h1>
			{page.content ? (
				<div className='markdown-content mt-4'>
					{/* #region agent log */}
					{/* Log right before rendering markdown content. */}
					{typeof window !== 'undefined' &&
						fetch('http://127.0.0.1:7243/ingest/3d260573-e526-4f00-b009-095d65decae6', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								sessionId: 'debug-session',
								runId: 'pre-fix-2',
								hypothesisId: 'H2',
								location: 'src/components/doc-page/doc-content.tsx:line27',
								message: 'Before markdown render',
								data: {
									pageId: page.id,
									contentLength: page.content.length,
								},
								timestamp: Date.now(),
							}),
						}).catch(() => {})}
					{/* #endregion */}
					<pre className='whitespace-pre-wrap font-sans text-sm'>
						{page.content}
					</pre>
				</div>
			) : (
				<div className='text-muted-foreground'>No content available</div>
			)}
		</div>
	)
}
