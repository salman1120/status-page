interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6" {...props}>
      {children}
    </div>
  )
}
