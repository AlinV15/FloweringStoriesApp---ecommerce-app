import Sidebar from './components/Sidebar'
import SidebarDrawer from './components/SidebarDrawer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar vizibil permanent pe desktop */}
            <div className="hidden md:block w-1/5 bg-gradient-to-b from-blue-50 to-blue-100 shadow-lg">
                <Sidebar />
            </div>

            {/* Drawer pentru mobil */}
            <SidebarDrawer />

            {/* Conținut principal */}
            <main className="flex-1 bg-white p-6 ml-0 md:ml-0 w-4/5">
                {children}
            </main>
        </div>
    )
}
