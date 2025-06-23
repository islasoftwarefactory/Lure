import React, { useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient'; // Import your Supabase client

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

declare global {
    interface Window {
        handleSignInWithGoogle: (response: any) => Promise<void>;
        google: any; // Define google object if needed elsewhere, or type more strictly
    }
}


const GoogleSignInButton: React.FC = () => {
    const googleButtonDiv = useRef<HTMLDivElement>(null);

    // Define the callback function globally so Google's script can find it
    useEffect(() => {
        window.handleSignInWithGoogle = async (response: any /* CredentialResponse */) => {
            console.log("Google Sign-In Response:", response);

            if (!response.credential) {
                console.error("Google Sign-In failed: No credential received.");
                // Handle error: show message to user, etc.
                return;
            }

            try {
                // Pass the ID token to Supabase
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: response.credential,
                    // You can add nonce here for extra security if you generate one
                    // nonce: 'YOUR_NONCE' // See Supabase docs for nonce generation [1]
                });

                if (error) {
                    console.error("Supabase Sign-In Error:", error.message);
                    // Handle Supabase error (e.g., show message)
                    return;
                }

                console.log("Supabase Sign-In Success:", data);
                
                // Fire GA4 events based on whether this is a new user or existing user
                if (typeof gtag !== 'undefined' && data.user) {
                  // Check if this is a new user signup or existing user login
                  // In Supabase, if user.created_at is very recent (within last few seconds), it's likely a signup
                  const userCreatedAt = new Date(data.user.created_at);
                  const currentTime = new Date();
                  const timeDifference = currentTime.getTime() - userCreatedAt.getTime();
                  const isNewUser = timeDifference < 10000; // Less than 10 seconds = new signup
                  
                  if (isNewUser) {
                    // Fire sign_up event for new users
                    gtag('event', 'sign_up', {
                      method: 'Google'
                    });
                    
                    console.log('GA4 sign_up event fired:', {
                      method: 'Google',
                      user_id: data.user.id,
                      email: data.user.email
                    });
                  } else {
                    // Fire login event for existing users
                    gtag('event', 'login', {
                      method: 'Google'
                    });
                    
                    console.log('GA4 login event fired:', {
                      method: 'Google',
                      user_id: data.user.id,
                      email: data.user.email
                    });
                  }
                }
                
                // Handle successful login:
                // - User session is now managed by Supabase client automatically
                // - You might want to redirect the user: navigate('/dashboard')
                // - Or update application state (e.g., using Context API)
                alert(`Successfully signed in! User: ${data.user?.email}`);

            } catch (error) {
                console.error("Error during Supabase sign-in:", error);
                // Handle unexpected errors
            }
        };

        // Cleanup function to remove the global function when the component unmounts
        return () => {
            delete window.handleSignInWithGoogle;
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Initialize and render the Google Button
    // This effect should run *after* the callback is defined globally
    useEffect(() => {
        if (!googleClientId) {
            console.error("VITE_GOOGLE_CLIENT_ID is not defined.");
            return;
        }
        if (typeof window.google !== 'undefined' && googleButtonDiv.current) {
             window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: window.handleSignInWithGoogle, // Reference the globally defined callback
                // Add other configurations if needed (e.g., nonce, FedCM) [1]
                // use_fedcm_for_prompt: true,
             });
             window.google.accounts.id.renderButton(
                googleButtonDiv.current,
                { theme: "outline", size: "large", type: "standard", shape:"pill" } // Customize button appearance [1]
             );
             // Optional: Prompt One Tap UI if desired
             // google.accounts.id.prompt();
        } else {
            console.log("Google Identity Services script not loaded yet or button div not ready.");
            // Optionally add a small delay or retry mechanism if needed,
            // but the `async defer` on the script tag usually handles this.
        }

    }, []); // Run once after mount

    return (
        <div>
            {/* The div where Google's button will be rendered */}
            <div ref={googleButtonDiv}></div>
            {/* You can add fallback content or loading indicator here */}
        </div>
    );
};

export default GoogleSignInButton; 