
import './globals.css';

export const metadata = {
  title: 'Apply for Agricultural Loan - AgriFin',
  description: 'Apply for agricultural loans for inputs, fertilizers, and farming equipment',
}

export default function PublicLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}