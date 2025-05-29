// app/components/LoadingSpinner.tsx
interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'dots' | 'pulse' | 'books';
}

export default function LoadingSpinner({
    message = "Loading...",
    size = 'md',
    variant = 'default'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16'
    };

    const dotSizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    const messageSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    if (variant === 'dots') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className={`
                                ${dotSizeClasses[size]}
                                rounded-full
                                animate-bounce
                            `}
                            style={{
                                background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)',
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.6s'
                            }}
                        />
                    ))}
                </div>
                {message && (
                    <p className={`text-[#9a6a63]/80 font-medium ${messageSizeClasses[size]}`}>
                        {message}
                    </p>
                )}
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    <div
                        className={`
                            ${sizeClasses[size]}
                            rounded-full
                            animate-ping
                            absolute
                        `}
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    />
                    <div
                        className={`
                            ${sizeClasses[size]}
                            rounded-full
                            animate-pulse
                            relative
                        `}
                        style={{ background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)' }}
                    />
                </div>
                {message && (
                    <p className={`text-[#9a6a63]/80 font-medium ${messageSizeClasses[size]}`}>
                        {message}
                    </p>
                )}
            </div>
        );
    }

    if (variant === 'books') {
        return (
            <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                    {/* Floating books animation */}
                    <div className="flex space-x-4">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="animate-bounce"
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    animationDuration: '1s'
                                }}
                            >
                                <div
                                    className={`
                                        ${size === 'sm' ? 'w-3 h-4' : size === 'md' ? 'w-4 h-5' : 'w-6 h-8'}
                                        rounded-sm
                                        shadow-lg
                                        transform rotate-12
                                    `}
                                    style={{
                                        background: i === 0 ? '#9a6a63' : i === 1 ? '#c1a5a2' : '#f2ded9'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {message && (
                    <p className={`text-[#9a6a63]/80 font-medium ${messageSizeClasses[size]}`}>
                        {message}
                    </p>
                )}
            </div>
        );
    }

    // Default modern spinner
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
                {/* Outer ring */}
                <div
                    className={`
                        ${sizeClasses[size]}
                        rounded-full
                        border-4
                        border-[#f2ded9]
                        animate-spin
                    `}
                    style={{
                        borderTopColor: '#9a6a63',
                        borderRightColor: '#c1a5a2',
                        animationDuration: '1s'
                    }}
                />

                {/* Inner pulsing dot */}
                <div
                    className={`
                        absolute
                        top-1/2
                        left-1/2
                        transform
                        -translate-x-1/2
                        -translate-y-1/2
                        ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'}
                        rounded-full
                        animate-pulse
                    `}
                    style={{
                        background: 'linear-gradient(135deg, #9a6a63 0%, #c1a5a2 100%)',
                        animationDuration: '2s'
                    }}
                />
            </div>

            {message && (
                <div className="text-center">
                    <p className={`text-[#9a6a63] font-semibold ${messageSizeClasses[size]} mb-1`}>
                        {message}
                    </p>
                    <div className="flex justify-center space-x-1">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-[#c1a5a2] animate-pulse"
                                style={{
                                    animationDelay: `${i * 0.3}s`,
                                    animationDuration: '1.5s'
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}