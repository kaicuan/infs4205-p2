'use server'

import { signIn, signOut } from '@/auth';
import { AuthError, CredentialsSignin } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
){
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return "Invalid credentials."
    }
    if (error instanceof AuthError) {
      return "Something went wrong."
    }
    throw error
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/login' })
}