'use client';

import { X } from 'lucide-react';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <div className="absolute inset-x-0 bottom-0 h-[75vh] md:relative md:inset-auto md:flex md:items-center md:justify-center md:min-h-full md:p-4 md:h-auto">
                <div className="w-full h-full md:w-auto md:h-auto md:max-w-lg md:max-h-[80vh] bg-gray-800/90 backdrop-blur-xl border border-gray-600/40 rounded-t-2xl md:rounded-2xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
                    <div className="md:hidden flex justify-center pt-3 pb-2 flex-shrink-0">
                        <div className="w-12 h-1 bg-gray-500 rounded-full"></div>
                    </div>

                    <div className="flex items-center justify-between p-6 pb-4 flex-shrink-0">
                        <h3 className="text-2xl font-bold text-white">How to Play</h3>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
                            aria-label="Close instructions"
                        >
                            <X className="w-5 h-5 text-gray-300 hover:text-white" />
                        </button>
                    </div>

                    <div className="flex-1 px-6 pb-6 overflow-y-auto scrollbar-hide md:overflow-y-auto">
                        <div className="space-y-4 text-gray-200">
                            <p className="text-sm md:text-base">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                                incididunt ut labore et dolore magna aliqua.
                            </p>

                            <div className="space-y-3">
                                <h4 className="text-base md:text-lg font-semibold text-green-400">Getting Started</h4>
                                <p className="text-sm md:text-base">
                                    Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                                    reprehenderit.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base md:text-lg font-semibold text-red-400">Game Rules</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
                                    <li>Excepteur sint occaecat cupidatat non proident</li>
                                    <li>Sunt in culpa qui officia deserunt mollit anim</li>
                                    <li>Id est laborum sed ut perspiciatis unde omnis</li>
                                    <li>Iste natus error sit voluptatem accusantium</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-base md:text-lg font-semibold text-blue-400">Controls</h4>
                                <p className="text-sm md:text-base">
                                    Doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                                    veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                                </p>
                            </div>

                            <div className="bg-gray-700/30 rounded-lg p-3">
                                <p className="text-xs md:text-sm text-gray-300">
                                    <strong>Tip:</strong> Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                                    odit aut fugit, sed quia consequuntur magni dolores eos qui ratione.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
