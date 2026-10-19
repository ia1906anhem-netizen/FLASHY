import { PhotographerSidebar } from '@/components/layout/photographer-sidebar'

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <PhotographerSidebar />
      {/* Main Photographer Content */}
      <div className="flex-1 overflow-y-auto">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}

