export function WhatsAppFloat() {
    const phoneNumber = "919080927452";
    const defaultMessage = "Hi! I'm interested in your electrical products. Can you help me?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Contact us on WhatsApp"
        >
            {/* Official WhatsApp Icon */}
            <svg
                viewBox="0 0 32 32"
                className="h-8 w-8"
                fill="currentColor"
            >
                <path d="M16 0c-8.837 0-16 7.163-16 16 0 2.825 0.737 5.607 2.137 8.048l-2.137 7.952 7.933-2.127c2.42 1.37 5.173 2.127 8.067 2.127 8.837 0 16-7.163 16-16s-7.163-16-16-16zM16 29.467c-2.482 0-4.908-0.646-7.07-1.87l-0.507-0.292-4.713 1.262 1.262-4.669-0.292-0.508c-1.207-2.100-1.847-4.507-1.847-6.924 0-7.435 6.050-13.485 13.485-13.485s13.485 6.050 13.485 13.485c0 7.435-6.050 13.485-13.485 13.485zM21.960 18.828c-0.326-0.163-1.932-0.953-2.231-1.062s-0.517-0.163-0.735 0.163c-0.218 0.326-0.844 1.062-1.034 1.280s-0.381 0.244-0.707 0.081c-1.862-0.93-3.084-1.662-4.309-3.769-0.326-0.562 0.326-0.524 0.934-1.743 0.102-0.218 0.051-0.407-0.029-0.57s-0.735-1.771-1.008-2.423c-0.265-0.633-0.534-0.547-0.735-0.558-0.19-0.009-0.408-0.011-0.626-0.011s-0.571 0.081-0.87 0.407c-0.299 0.326-1.141 1.116-1.141 2.721s1.168 3.156 1.33 3.374c0.163 0.218 2.295 3.504 5.561 4.915 2.057 0.889 2.861 0.950 3.888 0.799 0.625-0.091 1.932-0.789 2.204-1.551s0.272-1.415 0.19-1.551c-0.081-0.137-0.299-0.218-0.625-0.381z" />
            </svg>

            {/* Ripple effect */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping"></span>
        </a>
    );
}
