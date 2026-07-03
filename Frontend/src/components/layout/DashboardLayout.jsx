import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">

            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN AREA */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto px-6 py-6 bg-background">
                    <div className="max-w-[1400px] mx-auto w-full">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
