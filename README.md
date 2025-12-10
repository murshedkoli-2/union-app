# Union Parishad Admin Dashboard 🇧🇩

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

A modern, comprehensive Digital Union Parishad Management System designed to streamline administrative tasks, manage citizen data, issue certificates, and track revenue. Built with **Next.js App Router**, **MongoDB**, and **Tailwind CSS**.

## ✨ Key Features

### 🏛️ Citizen Management
- **Digital Database**: Centralized storage for all citizen data.
- **Detailed Profiles**: Track family info, address, NID, and date of birth.
- **Search & Filter**: Instantly find citizens by NID or Name.

### 📜 Certificate Issuance
- **Multi-Type Support**: Issue various certificates (Trade License, Character, Inheritance, etc.).
- **Automated Generation**: Generates professional, printable certificates with QR codes.
- **PDF Export**: High-quality PDF issuance using `html2canvas` and `jspdf`.
- **Payment Integration**: Track fees and payment status before issuance.

### 💰 Holding Tax & Finance
- **Tax Tracking**: Record and monitor yearly holding tax payments.
- **Revenue Reports**: Visual analytics of total revenue and pending dues.
- **Mandatory Tax Checks**: Option to enforce tax payment before certificate issuance.

### ⚙️ Dynamic Settings
- **Organization Profile**: Fully customizable Union name, logo, address, and Chairman info.
- **Theme Support**: Built-in Dark/Light mode.
- **Localization**: Support for Bangla and English content.

### 🔒 Security & Auth
- **Admin Dashboard**: Secure access control.
- **Two-Factor Authentication (2FA)**: Login protected by Email OTP.
- **Profile Management**: Securely update admin credentials and change passwords.
- **Email Notifications**: Real-time operational emails using SMTP (Gmail supported).

## 🚀 Data Visualization
- **Interactive Charts**: Revenue trends and certificate issuance statistics.
- **Real-time Stats**: Live counters for Citizens, Certificates, and Tax collections.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) + Mongoose
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email**: Nodemailer
- **PDF Generation**: html2canvas, jspdf

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/murshedkoli-2/union-app.git
    cd union-app
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory:
    ```env
    # Database
    MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/union-db

    # Security
    # (Optional) Add JWT secrets if extended

    # Email (Required for 2FA)
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=your-email@gmail.com
    SMTP_PASS=your-app-password
    SMTP_SECURE=false
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

5.  **Access the Dashboard**
    Open [http://localhost:3000](http://localhost:3000) in your browser.
    *Default Credentials:* `admin` / `admin123`

## 📧 Email Configuration (Gmail)
To use the 2FA and Email features with Gmail:
1.  Go to your Google Account > Security.
2.  Enable **2-Step Verification**.
3.  Go to **App Passwords**.
4.  Generate a new password for "Mail".
5.  Use that 16-character password in `SMTP_PASS`.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
