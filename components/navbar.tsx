"use client"

import Images from "next/image"
import Link from "next/link"
import PrimaryLogo from "../public/primary_logo.svg"
import { usePathname } from "next/navigation"

const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/session', label: 'Session' },
    { href: '/profile', label: 'Profile' },
    { href: '/settings', label: 'Settings' },
    { href: '/about', label: 'About' },
]


export default function Navbar() {
    const pathname = usePathname()
    const isActive = (path: string) => pathname === path

    return (
        <nav className="w-full bg-white mt-4 shadow-lg rounded-xl px-16 py-4 ">
            <div className="flex justify-between items-center">
                <div>
                    <Images src={PrimaryLogo} alt="SitSmart Logo" width={150}/>
                </div>
                <div className="flex gap-8">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href} className={isActive(link.href) ? "text-brand-primary font-medium" : "text-brand-foreground hover:text-brand-primary font-medium"}>
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </nav>
    )
}
          