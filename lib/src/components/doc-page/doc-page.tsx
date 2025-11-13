import { Button } from '../ui/button'

export const Documentation = () => {
	return (
		<div className='text-2xl'>
			<Button variant='outline' onClick={() => console.log('hello')}>
				Click me
			</Button>
			<Button variant='default'>Click me</Button>
			<Button variant='destructive'>Click me</Button>
			<Button variant='secondary'>Click me</Button>
			<Button variant='ghost'>Click me</Button>
			<Button variant='link'>Click me</Button>
		</div>
	)
}
