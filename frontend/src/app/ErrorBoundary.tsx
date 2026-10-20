import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * Optional heading override. The route-level boundary passes a friendlier
   * message ("This screen could not be displayed") than the app-level one.
   */
  title?: string
  /**
   * Optional reset hook. When provided, the "Try again" button calls it (so a
   * route can clear its own error state) instead of reloading the document.
   */
  onReset?: () => void
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Catches render-time exceptions from its subtree and shows a recoverable
 * fallback instead of letting the whole app blank out.
 *
 * React only routes render/lifecycle errors here, not async or event-handler
 * errors — those are logged globally in `main.tsx`.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the console trace for debugging; the user sees the fallback.
    console.error('Unhandled UI error', error, info.componentStack)
  }

  private handleReset = (): void => {
    this.setState({ error: null })
    this.props.onReset?.()

    if (!this.props.onReset) {
      window.location.reload()
    }
  }

  override render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-cream px-8 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <h1 className="text-xl text-maroon">
          {this.props.title ?? 'Something went wrong'}
        </h1>
        <p className="max-w-xs text-sm text-muted">
          An unexpected error stopped this screen from loading. You can try again.
        </p>
        <Button
          className="mt-2"
          onClick={this.handleReset}
          leadingIcon={<RefreshCw className="size-4" aria-hidden="true" />}
        >
          Try again
        </Button>
      </div>
    )
  }
}
