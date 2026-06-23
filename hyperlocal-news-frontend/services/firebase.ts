import auth, { FirebaseAuthTypes, GoogleAuthProvider } from '@react-native-firebase/auth';

// Lazy load to prevent "No Firebase App" crashes on startup
export const getFirebaseAuth = (): FirebaseAuthTypes.Module => {
  try {
    return auth();
  } catch (error: any) {
    console.warn(
      '⚠️ Native Firebase Auth is not available. Using fallback instance. ' +
      'Please ensure you run a native build (npm run android) instead of standard Expo Go.',
      error.message
    );
    return {
      currentUser: null,
      app: {
        name: '[DEFAULT]',
        options: { projectId: 'hypernews-bd322' },
      },
      onAuthStateChanged: () => () => {},
      signInWithPhoneNumber: async () => {
        throw new Error(
          'Firebase Auth not initialized. Ensure you built the project natively ' +
          '(npm run android) instead of running in Expo Go.'
        );
      },
      signInWithCredential: async () => {
        throw new Error(
          'Firebase Auth not initialized. Ensure you built the project natively ' +
          '(npm run android) instead of running in Expo Go.'
        );
      },
      signOut: async () => {},
    } as any;
  }
};

// ─── Phone Auth - Send OTP ────────────────────────────────────────────────────
export const sendPhoneOTP = async (
  phoneNumber: string
): Promise<FirebaseAuthTypes.ConfirmationResult> => {
  try {
    const confirmation = await getFirebaseAuth().signInWithPhoneNumber(phoneNumber);
    console.log('✅ OTP Sent to:', phoneNumber);
    return confirmation;
  } catch (error: any) {
    console.error('❌ OTP Send Failed:', error.message);
    throw error;
  }
};

// ─── Phone Auth - Verify OTP ──────────────────────────────────────────────────
export const verifyPhoneOTP = async (
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  otp: string
): Promise<string> => {
  try {
    const userCredential = await confirmation.confirm(otp);
    if (!userCredential?.user) throw new Error('Verification failed');
    const firebaseToken = await userCredential.user.getIdToken();
    console.log('✅ OTP Verified');
    return firebaseToken;
  } catch (error: any) {
    console.error('❌ OTP Verify Failed:', error.message);
    throw error;
  }
};

// ─── Google Sign-In ───────────────────────────────────────────────────────────
export const signInWithGoogle = async (idToken: string): Promise<string> => {
  try {
    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await getFirebaseAuth().signInWithCredential(googleCredential);
    const firebaseToken = await userCredential.user.getIdToken();
    console.log('✅ Google Sign-In Success');
    return firebaseToken;
  } catch (error: any) {
    console.error('❌ Google Sign-In Failed:', error.message);
    throw error;
  }
};

// ─── Get Current Firebase Token ───────────────────────────────────────────────
export const getCurrentFirebaseToken = async (): Promise<string | null> => {
  try {
    const currentUser = getFirebaseAuth().currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken(true);
  } catch {
    return null;
  }
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export const firebaseSignOut = async (): Promise<void> => {
  await getFirebaseAuth().signOut();
};

// ─── Check Firebase Connection ────────────────────────────────────────────────
export const checkFirebaseConnection = async (): Promise<void> => {
  try {
    const authInstance = getFirebaseAuth();
    console.log('✅ Firebase Connected:', authInstance.app.name);
    console.log('🔑 Project:', authInstance.app.options.projectId);
    console.log('👤 User:', authInstance.currentUser?.uid ?? 'None');
  } catch (error: any) {
    console.error('❌ Firebase Error:', error.message);
  }
};

export default getFirebaseAuth;
