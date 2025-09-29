import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface FooterButtonProps {
    href: string
    label: string
}

export const FooterButton = ({ href, label }: FooterButtonProps) => {
    return (
        <Button variant="link" className="w-full font-normal" size="sm" asChild>
            <Link href={href}>{label}</Link>
        </Button>
    )
}