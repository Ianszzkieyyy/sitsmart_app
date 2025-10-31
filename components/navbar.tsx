import Images from "next/image"
import Link from "next/link"
import PrimaryLogo from "../public/primary_logo.svg"

export default function Navbar() {
    return (
        <nav className="w-full bg-white mt-4 shadow-lg rounded-xl px-16 py-4 ">
            <div className="flex justify-between items-center">
                <div>
                    <Images src={PrimaryLogo} alt="SitSmart Logo" width={150}/>
                </div>
                <div className="flex gap-8">
                    <Link href="#" className="text-brand-foreground hover:text-brand-primary font-medium">Dashboard</Link>
                    <Link href="#" className="text-brand-foreground hover:text-brand-primary font-medium">Session</Link>
                    <Link href="#" className="text-brand-foreground hover:text-brand-primary font-medium">Profile</Link>
                    <Link href="#" className="text-brand-foreground hover:text-brand-primary font-medium">Settings</Link>
                    <Link href="#" className="text-brand-foreground hover:text-brand-primary font-medium">About</Link>
                </div>
            </div>
        </nav>
    )
}