import { DocPageNode } from '@/docs/types'

type DocContentProps = {
	page: DocPageNode | null
}

export function DocContent({ page }: DocContentProps) {
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
				<div className='markdown-content'>
					<pre className='whitespace-pre-wrap font-sans'>{page.content}</pre>
				</div>
			) : (
				<div className='text-muted-foreground'>No content available</div>
			)}
		</div>
	)
}

