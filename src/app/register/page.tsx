'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const register = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            if (!username || !email || !password) {
                throw new Error('All fields are required');
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            router.push(`../`);
        } catch (error) {
            setFeedback((error as Error).message || 'An unexpected error occured');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full text-white bg-gray-100">
            <div className="flex flex-col w-[400px] h-[500px] relative justify-center items-center rounded shadow-md gap-[5px] bg-gray-200">
                <button
                    onClick={() => router.push('/login')}
                    className="absolute right-85 top-5 py-2 pl-2 pr-1 rounded-[5px] bg-gray-200 hover:bg-gray-100"
                >
                    <Image src="/arrow.svg" height={30} width={30} priority={true} alt="user icon" />
                </button>

                <div className="font-bold text-3xl">Sign up</div>
                <div className="text-xs">Make an account to continue</div>

                <input
                    type="text"
                    className="border-1 border-gray-100 rounded-[5px] px-2 py-1 my-[30px] w-2/3 outline-none bg-gray-100"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="text"
                    className="border-1 border-gray-100 rounded-[5px] px-2 py-1 mb-[30px] w-2/3 outline-none bg-gray-100"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="border-1 border-gray-100 rounded-[5px] px-2 py-1 mb-[50px] w-2/3 outline-none bg-gray-100"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={() => register()}
                    className="py-2 w-[200px] rounded-[5px] mb-2 bg-purple-100 hover:bg-purple-50"
                >
                    Sign Up
                </button>

                {feedback && <div className="absolute bottom-10 text-red-500">{feedback}</div>}
            </div>
        </div>
    );
}
export default Register;
