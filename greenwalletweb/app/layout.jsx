import './globals.css'

export const metadata = {
  title: 'AgriFin - Agricultural Microfinance Platform',
  description: 'Empowering farmers with accessible loans for cash, inputs, fertilizers, and insurance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}