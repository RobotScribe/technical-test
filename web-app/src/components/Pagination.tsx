import React from 'react'
import { Button } from '../design-system'

interface PaginationProps {
	page: number
	totalPages: number
	onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => (
	<div className="flex items-center gap-4 py-4">
		<Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
			Previous
		</Button>
		<span>
			Page {page} / {Math.max(totalPages, 1)}
		</span>
		<Button
			variant="secondary"
			disabled={page >= totalPages}
			onClick={() => onPageChange(page + 1)}
		>
			Next
		</Button>
	</div>
)

export default Pagination
