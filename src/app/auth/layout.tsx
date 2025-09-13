const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-blue-300">
            {children}
        </div>
    )
}

export default AuthLayout