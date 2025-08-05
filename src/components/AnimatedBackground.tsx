export default function AnimatedBackground() {
    return (
        <div className="absolute inset-0 opacity-25">
            <div className="absolute top-1/4 left-1/6 w-3 h-3 bg-red-500 rounded-sm animate-pulse"></div>
            <div
                className="absolute top-1/4 right-1/6 w-3 h-3 bg-orange-500 rounded-sm animate-pulse"
                style={{ animationDelay: '3s' }}
            ></div>

            <div
                className="absolute top-1/6 left-1/2 w-2.5 h-2.5 bg-blue-500 rounded-sm animate-pulse"
                style={{ animationDelay: '1s' }}
            ></div>
            <div
                className="absolute bottom-1/6 left-1/2 w-2.5 h-2.5 bg-green-500 rounded-sm animate-pulse"
                style={{ animationDelay: '2s' }}
            ></div>

            <div
                className="absolute top-1/5 left-1/4 w-2 h-2 bg-white rounded-sm animate-pulse"
                style={{ animationDelay: '4s' }}
            ></div>
            <div
                className="absolute bottom-1/5 right-1/4 w-2 h-2 bg-yellow-400 rounded-sm animate-pulse"
                style={{ animationDelay: '5s' }}
            ></div>

            <div
                className="absolute top-2/3 left-1/3 w-2 h-2 bg-red-500 rounded-sm animate-pulse"
                style={{ animationDelay: '6s' }}
            ></div>
            <div
                className="absolute top-2/3 right-1/3 w-2 h-2 bg-orange-500 rounded-sm animate-pulse"
                style={{ animationDelay: '7s' }}
            ></div>

            <div
                className="absolute top-1/3 left-1/8 w-2 h-2 bg-blue-500 rounded-sm animate-pulse"
                style={{ animationDelay: '8s' }}
            ></div>
            <div
                className="absolute bottom-1/3 right-1/8 w-2 h-2 bg-green-500 rounded-sm animate-pulse"
                style={{ animationDelay: '9s' }}
            ></div>
            <div
                className="absolute top-1/2 left-1/12 w-1.5 h-1.5 bg-white rounded-sm animate-pulse"
                style={{ animationDelay: '10s' }}
            ></div>
            <div
                className="absolute top-1/2 right-1/12 w-1.5 h-1.5 bg-yellow-400 rounded-sm animate-pulse"
                style={{ animationDelay: '11s' }}
            ></div>

            <div
                className="absolute top-1/4 left-1/5 w-16 h-16 bg-red-900/20 rounded-lg animate-spin border border-red-700/30"
                style={{ animationDuration: '8s' }}
            ></div>
            <div
                className="absolute top-1/4 right-1/5 w-16 h-16 bg-orange-900/20 rounded-lg animate-spin border border-orange-700/30"
                style={{ animationDuration: '8s', animationDirection: 'reverse' }}
            ></div>

            <div
                className="absolute top-1/6 left-1/3 w-12 h-12 bg-blue-900/20 rounded-lg animate-bounce border border-blue-700/30"
                style={{ animationDelay: '1s' }}
            ></div>
            <div
                className="absolute bottom-1/6 right-1/3 w-12 h-12 bg-green-900/25 rounded-lg animate-bounce border border-green-700/30"
                style={{ animationDelay: '2s' }}
            ></div>

            <div
                className="absolute top-1/3 left-2/3 w-8 h-8 bg-white/20 rounded-lg animate-pulse border border-white/30"
                style={{ animationDelay: '3s' }}
            ></div>
            <div
                className="absolute bottom-1/3 right-2/3 w-8 h-8 bg-yellow-900/30 rounded-lg animate-pulse border border-yellow-700/30"
                style={{ animationDelay: '4s' }}
            ></div>

            <div
                className="absolute top-3/4 left-1/4 w-10 h-10 bg-red-900/15 rounded-lg animate-spin border border-red-700/20"
                style={{ animationDuration: '10s' }}
            ></div>
            <div
                className="absolute bottom-3/4 right-1/4 w-10 h-10 bg-orange-900/15 rounded-lg animate-spin border border-orange-700/20"
                style={{ animationDuration: '10s', animationDirection: 'reverse' }}
            ></div>
            <div
                className="absolute top-1/8 left-1/2 w-6 h-6 bg-blue-900/25 rounded-lg animate-bounce border border-blue-700/25"
                style={{ animationDelay: '5s' }}
            ></div>
            <div
                className="absolute bottom-1/8 right-1/2 w-6 h-6 bg-green-900/25 rounded-lg animate-bounce border border-green-700/25"
                style={{ animationDelay: '6s' }}
            ></div>

            <div className="absolute top-1/6 left-1/6 grid grid-cols-3 gap-0.5 w-8 h-8 opacity-40">
                <div className="bg-red-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-white w-2 h-2 rounded-sm"></div>
                <div className="bg-blue-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-green-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-red-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-orange-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-blue-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-yellow-500 w-2 h-2 rounded-sm"></div>
                <div className="bg-white w-2 h-2 rounded-sm"></div>
            </div>

            <div className="absolute bottom-1/6 right-1/6 grid grid-cols-3 gap-0.5 w-8 h-8 opacity-30">
                <div className="bg-orange-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-green-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-yellow-500 w-2 h-2 rounded-sm"></div>
                <div className="bg-white w-2 h-2 rounded-sm"></div>
                <div className="bg-orange-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-blue-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-green-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-red-600 w-2 h-2 rounded-sm"></div>
                <div className="bg-yellow-500 w-2 h-2 rounded-sm"></div>
            </div>

            <div className="absolute top-2/3 left-1/8 grid grid-cols-3 gap-0.5 w-6 h-6 opacity-25">
                <div className="bg-blue-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-red-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-white w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-yellow-500 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-blue-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-green-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-orange-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-white w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-red-600 w-1.5 h-1.5 rounded-sm"></div>
            </div>

            <div className="absolute bottom-2/3 right-1/8 grid grid-cols-3 gap-0.5 w-6 h-6 opacity-20">
                <div className="bg-green-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-orange-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-yellow-500 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-red-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-green-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-blue-600 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-white w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-yellow-500 w-1.5 h-1.5 rounded-sm"></div>
                <div className="bg-orange-600 w-1.5 h-1.5 rounded-sm"></div>
            </div>
        </div>
    );
}
