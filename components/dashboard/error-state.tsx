interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = "Failed to load data" }: ErrorStateProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="text-destructive text-lg font-semibold">⚠️ Error</div>
        <p className="text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          Please check your browser console for more details.
        </p>
      </div>
    </div>
  );
}

