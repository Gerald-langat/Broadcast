import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="flex flex-col justify-center items-center h-screen space-y-6">
      <SignedOut>
        <SignInButton />
      </SignedOut>

      <SignedIn>
        <div className="flex items-center space-x-3">
          <UserButton />
          <p>Welcome, {user?.firstName} {user?.lastName}</p>
        </div>
      </SignedIn>
    </div>
  );
}
