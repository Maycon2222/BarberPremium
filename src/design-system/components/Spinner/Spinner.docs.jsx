import { Skeleton, Spinner } from './Spinner'

export function SpinnerDocs() {
  return (
    <div>
      <Spinner />
      <Skeleton className="h-4 w-40" />
    </div>
  )
}

/*
PROP TABLE:
| Component | Props | Description |
| Spinner | className | Loading indicator |
| Skeleton | className | Loading placeholder |
*/
