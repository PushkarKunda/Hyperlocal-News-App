// services/firebase.ts
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const firebaseAuth = auth();

// ─── Phone Auth - Send OTP ────────────────────────────────────────────────────
export const sendPhoneOTP = async (
  phoneNumber: string
): Promise<FirebaseAuthTypes.ConfirmationResult> => {
  try {
    const confirmation = await firebaseAuth.signInWithPhoneNumber(phoneNumber);
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
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await firebaseAuth.signInWithCredential(googleCredential);
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
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) return null;
    return await currentUser.getIdToken(true);
  } catch {
    return null;
  }
};

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export const firebaseSignOut = async (): Promise<void> => {
  await firebaseAuth.signOut();
};

// ─── Check Firebase Connection ────────────────────────────────────────────────
export const checkFirebaseConnection = async (): Promise<void> => {
  try {
    console.log('✅ Firebase Connected:', firebaseAuth.app.name);
    console.log('🔑 Project:', firebaseAuth.app.options.projectId);
    console.log('👤 User:', firebaseAuth.currentUser?.uid ?? 'None');
  } catch (error: any) {
    console.error('❌ Firebase Error:', error.message);
  }
};

export default firebaseAuth;
