export const theme = {
    colors: {
        primary: '#10B981', // Modern Emerald Green
        primaryDark: '#059669', // Darker Emerald for gradients
        secondary: '#F59E0B', // Warm Amber
        background: '#F3F4F6', // Light Gray
        surface: '#FFFFFF',
        p20: '#d1fae5', // 20% opacity primary equivalent (light emerald)
        text: {
            primary: '#111827', // Dark Gray/Black
            secondary: '#6B7280', // Medium Gray
            disabled: '#9CA3AF',
            light: '#FFFFFF',
        },
        error: '#EF4444',
        success: '#10B981',
        border: '#E5E7EB',
        gradientStart: '#10B981',
        gradientEnd: '#059669',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800',
            lineHeight: 40,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            lineHeight: 32,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600',
            lineHeight: 28,
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
        },
        caption: {
            fontSize: 14,
            lineHeight: 20,
        },
        button: {
            fontSize: 16,
            fontWeight: '600',
        },
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
        },
    },
    borderRadius: {
        s: 6,
        m: 12,
        l: 20,
        xl: 30,
        round: 9999,
    },
};
