'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const { register, error } = useAuth();

    const handleRegister = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await register({ username, email, password });
            router.push('/');
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full text-white bg-gray-100">
            <div className="flex flex-col w-[400px] h-[500px] relative justify-center items-center rounded shadow-md gap-[5px] bg-gray-200">
                <button
                    onClick={() => router.push('/login')}
                    className="absolute right-85 top-5 py-2 pl-2 pr-1 rounded bg-gray-200 hover:bg-gray-100"
                >
                    <Image src="/arrow.svg" height={30} width={30} priority={true} alt="user icon" />
                </button>

                <div className="font-bold text-3xl">Sign up</div>
                <div className="text-xs">Make an account to continue</div>

                <input
                    type="text"
                    className="border-1 border-gray-100 rounded px-2 py-1 my-[30px] w-2/3 outline-none bg-gray-100"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="text"
                    className="border-1 border-gray-100 rounded px-2 py-1 mb-[30px] w-2/3 outline-none bg-gray-100"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    className="border-1 border-gray-100 rounded px-2 py-1 mb-[50px] w-2/3 outline-none bg-gray-100"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={() => handleRegister()}
                    className="py-2 w-[200px] rounded mb-2 bg-purple-100 hover:bg-purple-50"
                >
                    Sign Up
                </button>

                {error && <div className="absolute bottom-10 text-red-500">{error}</div>}
            </div>
        </div>
    );
}
export default Register;
