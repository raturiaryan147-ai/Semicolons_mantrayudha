import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, signInWithGoogle, signOutUser, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, UserAddress } from '../types';
import { INITIAL_USER_PROFILE } from '../data/mockData';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              name: data.displayName || firebaseUser.displayName || 'Nova Customer',
              email: data.email || firebaseUser.email || '',
              phone: data.phoneNumber || INITIAL_USER_PROFILE.phone,
              membershipTier: data.membershipTier || 'Nova Gold Member',
              memberSince: data.memberSince || 'October 2026',
              rewardPoints: data.rewardPoints || 450,
              addresses: data.addresses || INITIAL_USER_PROFILE.addresses
            });
          } else {
            // First time login - save profile to Firestore
            const initialData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Nova Customer',
              photoURL: firebaseUser.photoURL || '',
              phoneNumber: INITIAL_USER_PROFILE.phone,
              membershipTier: 'Nova Gold Member',
              rewardPoints: 450,
              memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
              addresses: INITIAL_USER_PROFILE.addresses,
              updatedAt: new Date().toISOString()
            };

            await setDoc(userRef, initialData);
            setUserProfile({
              name: initialData.displayName,
              email: initialData.email,
              phone: initialData.phoneNumber,
              membershipTier: initialData.membershipTier,
              memberSince: initialData.memberSince,
              rewardPoints: initialData.rewardPoints,
              addresses: initialData.addresses
            });
          }
        } catch (error) {
          console.warn('Could not read user profile from Firestore, using offline cache', error);
        }
      } else {
        // Fallback default profile when not logged in
        setUserProfile(INITIAL_USER_PROFILE);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setUserProfile(INITIAL_USER_PROFILE);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...data };
    setUserProfile(updated);

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(userRef, {
          displayName: updated.name,
          email: updated.email,
          phoneNumber: updated.phone,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const addAddress = async (address: Omit<UserAddress, 'id'>) => {
    const newAddr: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`
    };
    const updatedAddresses = [...userProfile.addresses];
    if (newAddr.isDefault) {
      updatedAddresses.forEach(a => (a.isDefault = false));
    }
    updatedAddresses.push(newAddr);

    const updated = { ...userProfile, addresses: updatedAddresses };
    setUserProfile(updated);

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(userRef, {
          addresses: updatedAddresses,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  const deleteAddress = async (addressId: string) => {
    const updatedAddresses = userProfile.addresses.filter(a => a.id !== addressId);
    if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }
    const updated = { ...userProfile, addresses: updatedAddresses };
    setUserProfile(updated);

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        await setDoc(userRef, {
          addresses: updatedAddresses,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isLoading,
        loginWithGoogle: login,
        logout,
        updateProfile,
        addAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
