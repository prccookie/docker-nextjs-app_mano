'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { FooterButton } from './footer-button'
import { Header } from './header'
import { Social } from './social'

interface CardWrapperProps {
    children: React.ReactNode
    headerLabel: string
    buttonLabel?: string
    buttonHref?: string
    showSocial?: boolean
}

export const CardWrapper = ({
    children,
    headerLabel,
    buttonLabel,
    buttonHref,
    showSocial,
}: CardWrapperProps) => {
    return (
        <Card className="w-[400px] shadow-md">
            <CardHeader>
                <Header label={headerLabel} />
            </CardHeader>
            <CardContent>{children}</CardContent>
            {showSocial && (
                <CardFooter>
                    <Social />
                </CardFooter>
            )}
            {buttonLabel && buttonHref && (
                <CardFooter>
                    <FooterButton label={buttonLabel} href={buttonHref} />
                </CardFooter>
            )}
        </Card>
    )
}