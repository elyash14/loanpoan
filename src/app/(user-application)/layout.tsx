
import MainLayout from './_components/MainLayout';

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
