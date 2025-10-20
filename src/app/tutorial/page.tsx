'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Scene from '@/components/three/scene';
import { Cube } from '@/components/three/cube';
import { Notation, KeybindMap, notationFromString } from '@/types/cubeTypes';

type TutorialStep = {
    title: string;
    description: string;
};

const defaultKeybinds: KeybindMap = {
    f: Notation.U_PRIME,
    j: Notation.U,
    s: Notation.D,
    l: Notation.D_PRIME,
    i: Notation.R,
    k: Notation.R_PRIME,
    d: Notation.L,
    e: Notation.L_PRIME,
    h: Notation.F,
    g: Notation.F_PRIME,
    w: Notation.B,
    o: Notation.B_PRIME,
    x: Notation.M_PRIME,
    '.': Notation.M_PRIME,
    '6': Notation.M,
    '0': Notation.S,
    '1': Notation.S_PRIME,
    '2': Notation.E,
    '9': Notation.E_PRIME,
    ';': Notation.y,
    a: Notation.y_PRIME,
    y: Notation.x,
    b: Notation.x_PRIME,
    p: Notation.z,
    q: Notation.z_PRIME,
};

const steps: TutorialStep[] = [
    {
        title: 'Welcome to the Cube Tutorial!',
        description:
            'In this tutorial, you’ll learn how to control the cube using your keyboard before playing real matches.',
    },
    {
        title: 'Basic Moves',
        description:
            'Use the keys "F", "J", "S", and "L" to rotate the top and bottom layers. Try it now and watch the cube respond!',
    },
    {
        title: 'Rotating the Cube',
        description:
            'You can rotate the entire cube using ";" (right), "A" (left), "Y" (up), and "B" (down). Rotating the cube during inspection will not trigger the solve timer',
    },
    {
        title: 'Your Goal',
        description:
            "The goal is to restore the cube to its solved state—each side showing one solid color. You'll have 15 seconds to inspect the cube before the timer automatically starts.",
    },
    {
        title: 'You’re Ready!',
        description: 'Great job! You’ve completed the tutorial. You can now join matches and compete with others!',
    },
];

export default function TutorialPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [ready, setReady] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!containerRef.current) return;

        console.log('Initializing 3D Scene...');
        const { scene, renderer, camera, webgl_cleanup } = Scene(containerRef.current);
        const cube = new Cube(scene, renderer, camera, 'D');
        setReady(true);

        const handleKeyDown = (e: KeyboardEvent) => {
            const move = defaultKeybinds[e.key];
            if (!move) return;

            const notation = notationFromString(move);
            if (notation) cube.handleInput(notation);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            webgl_cleanup?.();
        };
    }, []);

    const next = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    const back = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const step = steps[currentStep];

    return (
        <div className="relative w-screen h-screen bg-black text-white overflow-hidden">
            <div className="flex w-full h-full">
                {/* 3D Cube Area */}
                <div className="flex-1 flex items-center justify-center bg-[var(--color-gray-200)] p-4">
                    <div
                        ref={containerRef}
                        className="w-full h-full rounded-2xl overflow-hidden border-2 border-[var(--color-gray-100)]"
                    />
                </div>

                {/* Sidebar */}
                <aside className="w-96 bg-gray-100 border-l-2 border-gray-50 p-8 flex flex-col justify-between">
                    {!ready ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Loading tutorial...</div>
                    ) : (
                        <>
                            <div>
                                <h1 className="text-3xl font-bold mb-4">Tutorial</h1>
                                <h2 className="text-xl font-semibold">{step.title}</h2>
                                <p className="text-sm text-gray-300 mt-3 leading-relaxed">{step.description}</p>
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between mt-8">
                                <button
                                    onClick={back}
                                    disabled={currentStep === 0}
                                    className={`px-4 py-2 rounded-xl border transition-colors duration-150 ${
                                        currentStep === 0
                                            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                                            : 'hover:bg-[var(--color-purple-100)] hover:text-white'
                                    }`}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={next}
                                    disabled={currentStep === steps.length - 1}
                                    className={`px-4 py-2 rounded-xl border transition-colors duration-150 ${
                                        currentStep === steps.length - 1
                                            ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                                            : 'border-[var(--color-purple-50)] text-[var(--color-purple-50)] hover:bg-[var(--color-purple-50)] hover:text-white'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>

                            {/* Exit Button */}
                            <button
                                onClick={() => router.push('/')}
                                className="mt-6 w-full py-2 rounded-xl border border-gray-50 hover:bg-[var(--color-purple-50)] hover:text-white transition-colors duration-150"
                            >
                                Exit Tutorial
                            </button>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}
