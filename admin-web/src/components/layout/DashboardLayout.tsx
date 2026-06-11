import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface Props {
    children: ReactNode;
    title: string;
}

export const DashboardLayout = ({ children, title }: Props) => {
    return (
        <div className="flex h-screen overflow-hidden bg-dark-950">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header title={title} />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};
